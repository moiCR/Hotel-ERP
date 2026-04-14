<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { X, BedDouble, Loader } from "@lucide/vue";
import VModal from "@/components/vModal.vue";

interface Sede {
    id: number;
    ciudad: string;
    direccion: string;
}

interface CategoriaHabitacion {
    id: number;
    nombreCategoria: string;
    precio: number;
}

const props = defineProps<{
    isOpen: boolean;
    anchorEl?: HTMLElement | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "created"): void;
}>();

const sedes = ref<Sede[]>([]);
const categorias = ref<CategoriaHabitacion[]>([]);

const sedeOptions = computed(() =>
    sedes.value.map((s) => ({
        label: s.ciudad + (s.direccion ? " - " + s.direccion : ""),
        value: String(s.id),
    })),
);

const categoriaOptions = computed(() =>
    categorias.value.map((c) => ({
        label: c.nombreCategoria,
        value: String(c.id),
    })),
);

const estadoOptions = [
    { label: "Disponible", value: "Disponible" },
    { label: "Ocupada", value: "Ocupada" },
    { label: "Mantenimiento", value: "Mantenimiento" },
];

const form = ref({
    piso: "",
    estado: "",
    idSede: "",
    idCategoria: "",
});

const loading = ref(false);

async function getSedes() {
    try {
        const response = await fetch("/api/sede/all");
        const data = await response.json();
        if (data.success) {
            sedes.value = data.sedes;
        }
    } catch {
        // silently fail — selects will show empty
    }
}

async function getCategorias() {
    try {
        const response = await fetch("/api/categoriaHabitacion/all");
        const data = await response.json();
        if (data.success) {
            categorias.value = data.categorias;
        }
    } catch {
        // silently fail
    }
}

onMounted(async () => {
    await Promise.all([getSedes(), getCategorias()]);
});

const resetForm = () => {
    form.value = { piso: "", estado: "", idSede: "", idCategoria: "" };
};

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/habitacion/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                piso: parseInt(form.value.piso),
                estado: form.value.estado,
                idSede: parseInt(form.value.idSede),
                idCategoria: parseInt(form.value.idCategoria),
            }),
        });

        const data = await response.json();

        if (data.success) {
            const { useToast } = await import('#imports');
            useToast().showToast('Habitación creada correctamente', 'success');
            emit("created");
            emit("close");
            resetForm();
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || "Error al crear la habitación.", "error");
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
            resetForm();
        }
    },
);
</script>

<template>
    <VModal
        :is-open="isOpen"
        :anchor-el="anchorEl"
        layout-id="create-habitacion"
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
                        <BedDouble :size="16" class="text-white/50" />
                        <span
                            class="text-xs font-semibold text-white/40 tracking-wide"
                            >Gestión de Habitaciones</span
                        >
                    </div>
                    <h2 class="text-2xl font-bold text-white">
                        Crear Habitación
                    </h2>
                </div>

                <form
                    class="flex flex-col gap-3.5 mt-2"
                    @submit.prevent="submitForm"
                >
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 mb-0.5">Piso</label>
                        <input
                            v-model="form.piso"
                            type="number"
                            placeholder="Ej. 1"
                            min="1"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div class="flex flex-col gap-1 z-30">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Estado</label
                        >
                        <VSelect
                            v-model="form.estado"
                            :options="estadoOptions"
                            placeholder="Selecciona un estado"
                        />
                    </div>

                    <div class="flex flex-col gap-1 z-20">
                        <label class="text-xs text-white/50 mb-0.5">Sede</label>
                        <VSelect
                            v-model="form.idSede"
                            :options="sedeOptions"
                            placeholder="Selecciona una sede"
                        />
                    </div>

                    <div class="flex flex-col gap-1 z-10">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Categoría</label
                        >
                        <VSelect
                            v-model="form.idCategoria"
                            :options="categoriaOptions"
                            placeholder="Selecciona una categoría"
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
                        <span v-else>Crear Habitación</span>
                    </button>
                </form>
            </div>
        </div>
    </VModal>
</template>
