<script setup lang="ts">
import { ref, watch } from "vue";
import { X, Building2, Loader, Trash2 } from "@lucide/vue";
import VModal from "@/components/vModal.vue";
import SedeConfirmDeleteModal from "./SedeConfirmDeleteModal.vue";

interface Sede {
    id: number;
    ciudad: string;
    direccion: string;
    central: boolean;
}

const props = defineProps<{
    isOpen: boolean;
    originEl?: HTMLElement | null;
    sede: Sede | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "updated"): void;
}>();

const form = ref({
    id: 0,
    ciudad: "",
    direccion: "",
    central: false,
});

const loading = ref(false);
const isConfirmDeleteOpen = ref(false);

watch(
    () => [props.isOpen, props.sede] as const,
    ([isOpen, sede]) => {
        if (isOpen && sede) {
            form.value = {
                id: sede.id,
                ciudad: sede.ciudad || "",
                direccion: sede.direccion || "",
                central: sede.central || false,
            };
        }
    },
    { immediate: true },
);

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/sede/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: form.value.id,
                ciudad: form.value.ciudad,
                direccion: form.value.direccion,
                central: form.value.central,
            }),
        });

        const data = await response.json();

        if (data.success) {
            emit("updated");
            emit("close");
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || "Error al actualizar la sede.", "error");
        }
    } catch (e) {
        const { useToast } = await import('#imports');
        useToast().showToast("Ocurrió un error inesperado.", "error");
    } finally {
        loading.value = false;
    }
};

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
        :layout-id="`manage-sede-${sede?.id}`"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div v-if="sede" class="flex flex-col p-8 w-130 max-w-[95vw]">
            <div class="flex flex-col gap-1 mb-6">
                <div class="flex items-center gap-1.5 mb-0.5">
                    <Building2 :size="16" class="text-white/50" />
                    <span
                        class="text-xs font-semibold text-white/40 tracking-wide"
                        >Gestión de Sedes</span
                    >
                </div>
                <h2 class="text-2xl font-bold text-white">Editar Sede</h2>
            </div>

            <form
                class="flex flex-col gap-4 w-full"
                @submit.prevent="submitForm"
            >
                <!-- Ciudad / Dirección side by side -->
                <div class="flex gap-4">
                    <div class="flex flex-col gap-1 flex-1">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Ciudad</label
                        >
                        <input
                            v-model="form.ciudad"
                            type="text"
                            placeholder="Ej. San José"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>
                    <div class="flex flex-col gap-1 flex-1">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Dirección</label
                        >
                        <input
                            v-model="form.direccion"
                            type="text"
                            placeholder="Ej. Av. Central 100"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>
                </div>

                <!-- Central toggle full width -->
                <div
                    class="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                    @click="form.central = !form.central"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="p-2 rounded-lg transition-colors"
                            :class="
                                form.central
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-white/5 text-white/30'
                            "
                        >
                            <Building2 :size="20" />
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-white"
                                >Sede Central</span
                            >
                            <span class="text-xs text-white/50">
                                {{
                                    form.central
                                        ? "Esta sede es la sede central."
                                        : "Esta no es la sede central."
                                }}
                            </span>
                        </div>
                    </div>
                    <div
                        class="w-10 h-5 rounded-full relative transition-colors duration-300 shrink-0"
                        :class="
                            form.central
                                ? 'bg-emerald-500'
                                : 'bg-[#1f1f1f] border border-white/10'
                        "
                    >
                        <div
                            class="absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all duration-300"
                            :class="form.central ? 'left-5.5' : 'left-0.75'"
                        />
                    </div>
                </div>

                <!-- Footer actions -->
                <div class="pt-4 flex justify-between items-center w-full">
                    <button
                        type="button"
                        @click="openConfirmDelete"
                        class="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer group"
                    >
                        <Trash2
                            :size="16"
                            class="transition-transform group-hover:scale-110"
                        />
                        Eliminar Sede
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

    <SedeConfirmDeleteModal
        :is-open="isConfirmDeleteOpen"
        :sede="sede"
        @close="isConfirmDeleteOpen = false"
        @confirmed="handleDeleted"
    />
</template>
