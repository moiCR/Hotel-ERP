<script setup lang="ts">
import { ref, watch } from "vue";
import { X, ShieldPlus, Loader } from "@lucide/vue";

const props = defineProps<{
    isOpen: boolean;
    anchorEl?: HTMLElement | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "created"): void;
}>();

const form = ref({
    nombre: "",
});

const loading = ref(false);

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/roles/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.value),
        });

        const data = await response.json();

        if (data.success) {
            emit("created");
            emit("close");
            form.value = { nombre: "" };
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || "Error al crear el rol.", "error");
        }
    } catch (e) {
        const { useToast } = await import('#imports');
        useToast().showToast("Ocurrió un error inesperado.", "error");
    } finally {
        loading.value = false;
    }
};

watch(
    () => props.isOpen,
    (val) => {
        if (!val) {
            form.value = { nombre: "" };
        }
    },
);
</script>

<template>
    <VModal
        :is-open="isOpen"
        :anchor-el="anchorEl"
        layout-id="create-rol"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div class="flex flex-col p-8 w-95 max-w-[95vw]">
            <div class="w-full flex flex-col gap-3 mt-2">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1.5 mb-0.5">
                        <ShieldPlus :size="16" class="text-white/50" />
                        <span
                            class="text-xs font-semibold text-white/40 tracking-wide"
                            >Gestión de Roles</span
                        >
                    </div>
                    <h2 class="text-2xl font-bold text-white">Crear Rol</h2>
                </div>

                <form
                    class="flex flex-col gap-3.5 mt-2"
                    @submit.prevent="submitForm"
                >
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Nombre del Rol</label
                        >
                        <input
                            v-model="form.nombre"
                            type="text"
                            placeholder="Ej. Recepcionista"
                            required
                            autofocus
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="w-full hover:scale-101 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-4xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm mt-4"
                    >
                        <Loader
                            v-if="loading"
                            class="animate-spin"
                            :size="18"
                        />
                        <span v-else>Crear Rol</span>
                    </button>
                </form>
            </div>
        </div>
    </VModal>
</template>
