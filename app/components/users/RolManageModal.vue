<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { X, Shield, Plus, Loader } from "@lucide/vue";
import VModal from "@/components/vModal.vue";
import gsap from "gsap";

const onDropdownEnter = (el: Element, done: () => void) => {
    gsap.fromTo(el, 
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out", onComplete: done }
    );
};

const onDropdownLeave = (el: Element, done: () => void) => {
    gsap.to(el, 
        { opacity: 0, y: 10, scale: 0.95, duration: 0.15, ease: "power2.in", onComplete: done }
    );
};

interface Rol {
    id: number;
    nombre: string;
    permisos?: string[];
}

const props = defineProps<{
    isOpen: boolean;
    originEl?: HTMLElement | null;
    rol: Rol | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "updated"): void;
}>();

const AVAILABLE_PERMISSIONS = [
    { id: 'reservas', label: 'Reservas y Recepción' },
    { id: 'facturacion', label: 'Facturación y Cobros' },
    { id: 'usuarios', label: 'Gestión de Usuarios' },
    { id: 'hotel', label: 'Configuración del Hotel' },
    { id: 'reportes', label: 'Ver Reportes' },
    { id: 'bitacora', label: 'Auditoría (Bitácora)' },
    { id: 'ajustes', label: 'Ajustes Generales' }
]

const form = ref({
    id: "",
    nombre: "",
    permisos: [] as string[]
});

const isDropdownOpen = ref(false);
const loading = ref(false);

watch(
    () => [props.isOpen, props.rol],
    ([isOpen, rol]) => {
        if (isOpen && rol) {
            form.value = {
                id: String((rol as Rol).id),
                nombre: (rol as Rol).nombre || "",
                permisos: [...((rol as Rol).permisos || [])]
            };
        } else {
            isDropdownOpen.value = false;
        }
    },
    { immediate: true },
);

const unselectedPermissions = computed(() => {
    return AVAILABLE_PERMISSIONS.filter(p => !form.value.permisos.includes(p.id))
})

const addPermission = (permId: string) => {
    if (!form.value.permisos.includes(permId)) {
        form.value.permisos.push(permId);
    }
    isDropdownOpen.value = false;
}

const removePermission = (permId: string) => {
    form.value.permisos = form.value.permisos.filter(p => p !== permId);
}

const getPermissionLabel = (permId: string) => {
    return AVAILABLE_PERMISSIONS.find(p => p.id === permId)?.label || permId;
}

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/roles/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.value),
        });

        const data = await response.json();

        if (data.success) {
            const { useToast } = await import('#imports');
            useToast().showToast('Rol actualizado correctamente', 'success');
            emit("updated");
            emit("close");
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || 'Error al actualizar', "error");
        }
    } catch (error) {
        const { useToast } = await import('#imports');
        useToast().showToast("Ocurrió un error al actualizar el rol.", "error");
    } finally {
        loading.value = false;
    }
};

// Close dropdown when clicking outside
const closeDropdown = (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.permission-dropdown-container')) {
        isDropdownOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', closeDropdown)
})
onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
})
</script>

<template>
    <VModal
        :is-open="isOpen"
        :origin-el="originEl"
        :layout-id="`manage-rol-${rol?.id}`"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div v-if="rol" class="flex flex-col p-8 w-130 max-w-[95vw] h-auto">
            <div class="flex flex-col gap-1 mb-8">
                <div class="flex items-center gap-1.5 mb-0.5">
                    <Shield :size="16" class="text-brand/70" />
                    <span
                        class="text-xs font-semibold text-brand/60 tracking-widest uppercase"
                        >Editar Rol</span
                    >
                </div>
                <h2 class="text-2xl font-bold text-white tracking-tight">
                    Gestión de Permisos
                </h2>
            </div>

            <form
                class="flex flex-col gap-6 w-full"
                @submit.prevent="submitForm"
            >
                <div class="flex flex-col gap-1.5 flex-1">
                    <label class="text-xs text-white/50">Nombre del Rol</label>
                    <input
                        v-model="form.nombre"
                        type="text"
                        required
                        class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/15 transition-colors"
                    />
                </div>

                <div class="flex flex-col gap-3">
                    <label class="text-xs text-white/50">Permisos Asignados</label>
                    
                    <div class="flex flex-wrap gap-2 items-center bg-[#1f1f1f] border border-white/5 rounded-xl p-4 min-h-[80px]">
                        
                        <div 
                            v-for="perm in form.permisos" 
                            :key="perm"
                            class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/90 group transition-colors hover:bg-white/10"
                        >
                            <span>{{ getPermissionLabel(perm) }}</span>
                            <button 
                                type="button" 
                                @click="removePermission(perm)"
                                class="text-white/40 hover:text-red-400 focus:outline-none transition-colors"
                            >
                                <X :size="14" />
                            </button>
                        </div>
                        
                        <div v-if="form.permisos.length === 0" class="text-sm text-white/30 italic">
                            No hay permisos asignados
                        </div>

                        <div class="relative ml-2 permission-dropdown-container">
                            <button 
                                type="button" 
                                @click="isDropdownOpen = !isDropdownOpen"
                                class="w-8 h-8 rounded-full bg-brand/10 text-brand border border-brand/20 flex items-center justify-center hover:bg-brand/20 transition-colors focus:outline-none"
                                title="Añadir permiso"
                            >
                                <Plus :size="16" />
                            </button>

                            <Transition
                                @enter="onDropdownEnter"
                                @leave="onDropdownLeave"
                                :css="false"
                            >
                                <div 
                                    v-if="isDropdownOpen" 
                                    class="absolute right-0 bottom-full mb-2 w-64 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl z-[999] overflow-hidden"
                                >
                                    <div class="max-h-60 overflow-y-auto py-2">
                                        <button
                                            v-for="perm in unselectedPermissions"
                                            :key="perm.id"
                                            type="button"
                                            @click="addPermission(perm.id)"
                                            class="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex justify-between items-center"
                                        >
                                            {{ perm.label }}
                                        </button>
                                        <div v-if="unselectedPermissions.length === 0" class="px-4 py-3 text-sm text-white/40 italic text-center">
                                            Todos los permisos asignados
                                        </div>
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </div>

                <div class="pt-6 flex justify-end items-center w-full">
                    <div class="flex gap-3">
                        <button
                            type="button"
                            @click="emit('close')"
                            class="py-2.5 px-6 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-white/70 hover:text-white cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="loading"
                            class="hover:scale-101 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black font-semibold py-2.5 px-8 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm"
                        >
                            <Loader
                                v-if="loading"
                                class="animate-spin"
                                :size="16"
                            />
                            <span v-else>Guardar Cambios</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </VModal>
</template>
