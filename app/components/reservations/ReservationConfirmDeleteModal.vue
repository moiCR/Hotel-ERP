<script setup lang="ts">
import { ref } from "vue";
import { AlertTriangle, Loader } from "@lucide/vue";

const props = defineProps<{
    isOpen: boolean;
    reserva: any;
    originEl?: HTMLElement | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "confirmed"): void;
}>();

const deleting = ref(false);

const confirmDelete = async () => {
    if (!props.reserva) return;
    deleting.value = true;
    try {
        const response = await fetch(`/api/reservations/delete?id=${props.reserva.id}`, {
            method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
            emit("confirmed");
            emit("close");
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || 'Error al eliminar', 'error');
        }
    } catch (e) {
        const { useToast } = await import('#imports');
        useToast().showToast('Error de conexión', 'error');
    } finally {
        deleting.value = false;
    }
};
</script>

<template>
    <VModal
        :is-open="isOpen"
        :origin-el="originEl"
        :layout-id="`delete-reserva-${reserva?.id}`"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <div class="flex flex-col p-8 w-110 max-w-[95vw] h-auto">
            <div
                class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20"
            >
                <AlertTriangle class="text-red-500" :size="32" />
            </div>

            <h2 class="text-2xl font-bold text-white mb-2">
                Anular Reserva
            </h2>
            <p class="text-white/60 text-sm leading-relaxed mb-8">
                ¿Estás seguro de que deseas anular esta reserva asignada a <strong class="text-white">{{ reserva?.Cliente?.nombre }} {{ reserva?.Cliente?.apellidos }}</strong> en la <strong class="text-white">Habitación {{ reserva?.Habitacion?.piso }}0{{ reserva?.Habitacion?.id % 9 + 1 }}</strong>?<br/><br/>
                Esta acción liberará la habitación inmediatamente y <strong class="text-red-400">no se registrará factura</strong>. Quedará registro en bitácora.
            </p>

            <div class="flex items-center justify-end gap-3 w-full mt-auto">
                <button
                    @click="emit('close')"
                    class="px-6 py-3 rounded-2xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    @click="confirmDelete"
                    :disabled="deleting"
                    class="px-6 py-3 rounded-2xl text-sm font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 flex items-center gap-2 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Loader v-if="deleting" class="animate-spin" :size="16" />
                    <span v-else>Sí, anular reserva</span>
                </button>
            </div>
        </div>
    </VModal>
</template>
