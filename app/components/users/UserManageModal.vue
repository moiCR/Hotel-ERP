<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import {
    X,
    UserCog,
    Loader,
    Shield,
    Building2,
    UserCircle2,
    Mail,
    BadgeCheck,
    BadgeAlert,
    Trash2,
} from "@lucide/vue";
import VModal from "@/components/vModal.vue";
import UserConfirmDeleteModal from "./UserConfirmDeleteModal.vue";

interface Rol {
    id: number;
    nombre: string;
}

interface Sede {
    id: number;
    ciudad: string;
    direccion: string;
    central: boolean;
}

interface User {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    contrasena: string | null;
    isActive: boolean;
    activationToken: string | null;
    createdAt: string;
    Rol: {
        nombre: string;
    };
    Sede?: {
        ciudad: string;
        direccion: string;
    };
    idRol?: number;
    idSede?: number;
}

const props = defineProps<{
    isOpen: boolean;
    originEl?: HTMLElement | null;
    user: User | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "updated"): void;
}>();

const sedes = ref<Sede[]>([]);
const roles = ref<Rol[]>([]);

async function getRoles() {
    const response = await fetch("/api/roles/all");
    const data = await response.json();
    if (data.success) {
        roles.value = data.roles;
    }
}

async function getSedes() {
    const response = await fetch("/api/sede/all");
    const data = await response.json();
    if (data.success) {
        sedes.value = data.sedes;
    }
}

onMounted(async () => {
    await Promise.all([getRoles(), getSedes()]);
});

const roleOptions = computed(() =>
    roles.value.map((r) => ({ label: r.nombre, value: String(r.id) })),
);
const sedeOptions = computed(() =>
    sedes.value.map((s) => ({
        label: s.ciudad + (s.direccion ? " - " + s.direccion : ""),
        value: String(s.id),
    })),
);

const loading = ref(false);

const form = ref({
    id: "",
    nombre: "",
    apellidos: "",
    email: "",
    rolId: "",
    sedeId: "",
    isActive: false,
});

watch(
    () => [props.isOpen, props.user],
    ([isOpen, user]) => {
        if (isOpen && user) {
            let rId = (user as User).idRol?.toString() || "";
            if (!rId) {
                const matchedRole = roles.value.find(
                    (r) =>
                        r.nombre === (document as any).user?.Rol?.nombre ||
                        r.nombre === (user as User).Rol?.nombre,
                );
                rId = matchedRole ? String(matchedRole.id) : "";
            }

            let sId = (user as User).idSede?.toString() || "";
            if (!sId) {
                const matchedSede = sedes.value.find(
                    (s) =>
                        s.ciudad === (document as any).user?.Sede?.ciudad ||
                        s.ciudad === (user as User).Sede?.ciudad,
                );
                sId = matchedSede ? String(matchedSede.id) : "";
            }

            form.value = {
                id: String((user as User).id),
                nombre: (user as User).nombre || "",
                apellidos: (user as User).apellidos || "",
                email: (user as User).email || "",
                rolId: rId,
                sedeId: sId,
                isActive: (user as User).isActive || false,
            };
        }
    },
    { immediate: true },
);

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/users/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.value),
        });

        const data = await response.json();

        if (data.success) {
            const { useToast } = await import('#imports');
            useToast().showToast('Usuario actualizado correctamente', 'success');
            emit("updated");
            emit("close");
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || 'Error al actualizar', "error");
        }
    } catch (error) {
        const { useToast } = await import('#imports');
        useToast().showToast("Ocurrió un error al actualizar el usuario.", "error");
    } finally {
        loading.value = false;
    }
};
const isConfirmDeleteOpen = ref(false);

const openConfirmDelete = () => {
    isConfirmDeleteOpen.value = true;
};

const handleDeleted = () => {
    emit("updated");
    emit("close");
};
</script>

<template>
    <VModal
        :is-open="isOpen"
        :origin-el="originEl"
        :layout-id="`manage-user-${user?.id}`"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div v-if="user" class="flex flex-col p-8 w-150 max-w-[95vw] h-auto">
            <div class="flex flex-col gap-1 mb-8">
                <div class="flex items-center gap-1.5 mb-0.5">
                    <UserCog :size="16" class="text-brand/70" />
                    <span
                        class="text-xs font-semibold text-brand/60 tracking-widest uppercase"
                        >Editar Usuario</span
                    >
                </div>
                <h2 class="text-2xl font-bold text-white tracking-tight">
                    Preferencias y Acceso
                </h2>
            </div>

            <form
                class="flex flex-col gap-5 w-full"
                @submit.prevent="submitForm"
            >
                <div class="flex gap-4">
                    <div class="flex flex-col gap-1.5 flex-1">
                        <label
                            class="text-xs text-white/50 flex items-center gap-1.5"
                            ><UserCircle2 :size="12" />Nombre</label
                        >
                        <input
                            v-model="form.nombre"
                            type="text"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/15 transition-colors"
                        />
                    </div>
                    <div class="flex flex-col gap-1.5 flex-1">
                        <label class="text-xs text-white/50">Apellidos</label>
                        <input
                            v-model="form.apellidos"
                            type="text"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/15 transition-colors"
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label
                        class="text-xs text-white/50 flex items-center gap-1.5"
                        ><Mail :size="12" />Correo Electrónico</label
                    >
                    <input
                        v-model="form.email"
                        type="email"
                        required
                        class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/15 transition-colors"
                    />
                </div>

                <div class="flex gap-4 w-full relative">
                    <div class="flex flex-col gap-1.5 flex-1 min-w-0 z-30">
                        <label
                            class="text-xs text-white/50 flex items-center gap-1.5"
                            ><Shield :size="12" />Rol de Usuario</label
                        >
                        <VSelect
                            v-model="form.rolId"
                            :options="roleOptions"
                            placeholder="Selecciona un rol"
                            class="w-full"
                        />
                    </div>
                    <div class="flex flex-col gap-1.5 flex-1 min-w-0 z-20">
                        <label
                            class="text-xs text-white/50 flex items-center gap-1.5"
                            ><Building2 :size="12" />Sede Asignada</label
                        >
                        <VSelect
                            v-model="form.sedeId"
                            :options="sedeOptions"
                            placeholder="Selecciona una sede"
                            class="w-full"
                        />
                    </div>
                </div>

                <div
                    class="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl mt-2 cursor-pointer hover:bg-white/10 transition-colors"
                    @click="form.isActive = !form.isActive"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="p-2 rounded-lg"
                            :class="
                                form.isActive
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-red-500/10 text-red-500'
                            "
                        >
                            <BadgeCheck v-if="form.isActive" :size="20" />
                            <BadgeAlert v-else :size="20" />
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-white"
                                >Estado de la cuenta</span
                            >
                            <span class="text-xs text-white/50">{{
                                form.isActive
                                    ? "El usuario tiene acceso al sistema."
                                    : "El usuario no tiene acceso al sistema."
                            }}</span>
                        </div>
                    </div>
                    <div
                        class="w-10 h-5 rounded-full relative transition-colors duration-300"
                        :class="
                            form.isActive
                                ? 'bg-emerald-500'
                                : 'bg-[#1f1f1f]/50 border border-white/10'
                        "
                    >
                        <div
                            class="absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all duration-300"
                            :class="
                                form.isActive ? 'left-[22px]' : 'left-[3px]'
                            "
                        ></div>
                    </div>
                </div>

                <div class="pt-6 flex justify-between items-center w-full">
                    <button
                        type="button"
                        @click="openConfirmDelete"
                        class="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer group"
                    >
                        <Trash2
                            :size="16"
                            class="transition-transform group-hover:scale-110"
                        />
                        Eliminar Usuario
                    </button>

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

    <UserConfirmDeleteModal
        :is-open="isConfirmDeleteOpen"
        :user="user"
        @close="isConfirmDeleteOpen = false"
        @confirmed="handleDeleted"
    />
</template>
