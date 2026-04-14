<script setup lang="ts">
import { ref, watch } from "vue";
import { X, UserPlus, Loader } from "@lucide/vue";

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
    apellidos: "",
    cedula: "",
});

const modalError = ref("");
const loading = ref(false);

const submitForm = async () => {
    if (!form.value.nombre || !form.value.apellidos || !form.value.cedula) {
        modalError.value = "Todos los campos son obligatorios.";
        return;
    }
    
    loading.value = true;
    modalError.value = "";
    
    try {
        const response = await fetch("/api/clients/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.value),
        });

        const data = await response.json();

        if (data.success) {
            emit("created");
            emit("close");

            form.value = {
                nombre: "",
                apellidos: "",
                cedula: "",
            };
        } else {
            modalError.value = data.message;
        }
    } catch (error) {
        modalError.value = "Ocurrió un error al registrar el cliente.";
    } finally {
        loading.value = false;
    }
};

watch(
    () => props.isOpen,
    (val) => {
        if (!val) {
            form.value = { nombre: "", apellidos: "", cedula: "" };
            modalError.value = "";
        }
    },
);
</script>

<template>
    <VModal
        :is-open="isOpen"
        :anchor-el="anchorEl"
        :layout-id="'create-client'"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div class="flex flex-col p-8 w-105 max-w-[95vw] h-auto">
            <div class="w-full flex flex-col gap-3 mt-2">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1.5 mb-0.5">
                        <UserPlus :size="16" class="text-white/50" />
                        <span class="text-xs font-semibold text-white/40 tracking-wide">Gestión de Clientes</span>
                    </div>
                    <h2 class="text-2xl font-bold text-white">Registrar Cliente</h2>
                </div>

                <div v-if="modalError" class="bg-red-500/10 text-red-500 rounded-xl px-4 py-3 text-sm mt-2 border border-red-500/20">
                    {{ modalError }}
                </div>

                <!-- Form -->
                <form class="flex flex-col gap-3.5 mt-2" @submit.prevent="submitForm">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 mb-0.5">Cédula / Pasaporte</label>
                        <input
                            v-model="form.cedula"
                            type="text"
                            placeholder="Ej. 101110111"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 mb-0.5">Nombre</label>
                        <input
                            v-model="form.nombre"
                            type="text"
                            placeholder="Ej. Juan"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 mb-0.5">Apellidos</label>
                        <input
                            v-model="form.apellidos"
                            type="text"
                            placeholder="Ej. Pérez"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="w-full hover:scale-101 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-4xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm mt-4"
                    >
                        <Loader v-if="loading" class="animate-spin" />
                        <span v-else>Guardar Cliente</span>
                    </button>
                </form>
            </div>
        </div>
    </VModal>
</template>
