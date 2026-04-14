<script setup lang="ts">
import { ref } from "vue";
import { AlertTriangle, Loader, X } from "@lucide/vue";
import VModal from "@/components/vModal.vue";

interface Categoria {
    id: number;
    nombreCategoria: string;
    precio: number;
}

const props = defineProps<{
    isOpen: boolean;
    categoria: Categoria | null;
    originEl?: HTMLElement | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "confirmed"): void;
}>();

const loading = ref(false);

const confirmDelete = async () => {
    if (!props.categoria) return;

    loading.value = true;
    try {
        const response = await fetch("/api/categoriaHabitacion/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: props.categoria.id }),
        });

        const data = await response.json();

        if (data.success) {
            emit("confirmed");
            emit("close");
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || "Error al eliminar la categoría.", "error");
        }
    } catch (e) {
        const { useToast } = await import('#imports');
        useToast().showToast("Ocurrió un error inesperado.", "error");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <VModal
        :is-open="isOpen"
        :origin-el="originEl"
        :layout-id="
            categoria ? `delete-categoria-${categoria.id}` : 'delete-categoria'
        "
        @close="emit('close')"
        class="bg-[#181818] border border-white/5"
    >
        <div class="flex flex-col p-8 w-100 max-w-[95vw] relative">
            <button
                @click="emit('close')"
                class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
            >
                <X :size="18" class="text-white/40" />
            </button>

            <div class="flex flex-col items-center text-center gap-4">
                <div
                    class="w-16 h-16 rounded-full bg-red-500/10 flex justify-center items-center text-red-500 mb-2"
                >
                    <AlertTriangle :size="32" />
                </div>

                <div class="flex flex-col gap-1">
                    <h2 class="text-xl font-bold text-white tracking-tight">
                        ¿Eliminar Categoría?
                    </h2>
                    <p class="text-sm text-gray-400">
                        Esta acción no se puede deshacer. La categoría
                        <strong class="text-white font-medium">{{
                            categoria?.nombreCategoria
                        }}</strong>
                        será eliminada permanentemente. Las habitaciones
                        asociadas quedarán sin categoría.
                    </p>
                </div>

                <div class="flex flex-col w-full gap-3 mt-6">
                    <button
                        @click="confirmDelete"
                        :disabled="loading"
                        class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Loader
                            v-if="loading"
                            class="animate-spin"
                            :size="18"
                        />
                        <span v-else>Sí, Eliminar Permanentemente</span>
                    </button>

                    <button
                        @click="emit('close')"
                        :disabled="loading"
                        class="w-full py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </VModal>
</template>
