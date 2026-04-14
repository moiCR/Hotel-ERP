<script setup lang="ts">
import { ref, watch } from "vue";
import { X, Building2, Loader } from "@lucide/vue";
import VModal from "@/components/vModal.vue";

const props = defineProps<{
    isOpen: boolean;
    anchorEl?: HTMLElement | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "created"): void;
}>();

const form = ref({
    ciudad: "",
    direccion: "",
    central: false,
});

const loading = ref(false);

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/sede/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.value),
        });

        const data = await response.json();

        if (data.success) {
            const { useToast } = await import('#imports');
            useToast().showToast('Sede creada correctamente', 'success');
            emit("created");
            emit("close");
            form.value = { ciudad: "", direccion: "", central: false };
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || "Error al crear la sede.", "error");
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
            form.value = { ciudad: "", direccion: "", central: false };
        }
    },
);
</script>

<template>
    <VModal
        :is-open="isOpen"
        :anchor-el="anchorEl"
        layout-id="create-sede"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div class="flex flex-col p-8 w-105 max-w-[95vw]">
            <div class="w-full flex flex-col gap-3 mt-2">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1.5 mb-0.5">
                        <Building2 :size="16" class="text-white/50" />
                        <span
                            class="text-xs font-semibold text-white/40 tracking-wide"
                            >Gestión de Sedes</span
                        >
                    </div>
                    <h2 class="text-2xl font-bold text-white">Crear Sede</h2>
                </div>

                <form
                    class="flex flex-col gap-3.5 mt-2"
                    @submit.prevent="submitForm"
                >
                    <div class="flex flex-col gap-1">
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

                    <div class="flex flex-col gap-1">
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

                    <div
                        class="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl mt-1 cursor-pointer hover:bg-white/10 transition-colors"
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
                        <span v-else>Crear Sede</span>
                    </button>
                </form>
            </div>
        </div>
    </VModal>
</template>
