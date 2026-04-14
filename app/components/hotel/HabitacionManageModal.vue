<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, BedDouble, Loader, Trash2 } from '@lucide/vue';
import VModal from '@/components/vModal.vue';
import HabitacionConfirmDeleteModal from './HabitacionConfirmDeleteModal.vue';

interface Habitacion {
    id: number;
    piso: number;
    estado: string;
    idSede: number;
    idCategoria: number;
    CategoriaHabitacion: {
        id: number;
        nombreCategoria: string;
        precio: number;
    };
    Sede: {
        id: number;
        ciudad: string;
    };
}

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
    originEl?: HTMLElement | null;
    habitacion: Habitacion | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'updated'): void;
}>();

const sedes = ref<Sede[]>([]);
const categorias = ref<CategoriaHabitacion[]>([]);

const sedeOptions = computed(() =>
    sedes.value.map(s => ({
        label: s.ciudad + (s.direccion ? ' - ' + s.direccion : ''),
        value: String(s.id),
    }))
);

const categoriaOptions = computed(() =>
    categorias.value.map(c => ({
        label: c.nombreCategoria,
        value: String(c.id),
    }))
);

const estadoOptions = [
    { label: 'Disponible', value: 'Disponible' },
    { label: 'Ocupada', value: 'Ocupada' },
    { label: 'Mantenimiento', value: 'Mantenimiento' },
];

const form = ref({
    id: 0,
    piso: '',
    estado: '',
    idSede: '',
    idCategoria: '',
});

const loading = ref(false);
const isConfirmDeleteOpen = ref(false);

async function getSedes() {
    try {
        const response = await fetch('/api/sede/all');
        const data = await response.json();
        if (data.success) {
            sedes.value = data.sedes;
        }
    } catch {
        // silently fail
    }
}

async function getCategorias() {
    try {
        const response = await fetch('/api/categoriaHabitacion/all');
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

watch(() => [props.isOpen, props.habitacion] as const, ([isOpen, habitacion]) => {
    if (isOpen && habitacion) {
        form.value = {
            id: habitacion.id,
            piso: String(habitacion.piso),
            estado: habitacion.estado || '',
            idSede: String(habitacion.idSede),
            idCategoria: String(habitacion.idCategoria),
        };
    }
}, { immediate: true });

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch('/api/habitacion/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: form.value.id,
                piso: parseInt(form.value.piso),
                estado: form.value.estado,
                idSede: parseInt(form.value.idSede),
                idCategoria: parseInt(form.value.idCategoria),
            }),
        });

        const data = await response.json();

        if (data.success) {
            emit('updated');
            emit('close');
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || 'Error al actualizar la habitación.', "error");
        }
    } catch (e) {
        const { useToast } = await import('#imports');
        useToast().showToast('Ocurrió un error inesperado.', "error");
    } finally {
        loading.value = false;
    }
};

const openConfirmDelete = () => {
    isConfirmDeleteOpen.value = true;
};

const handleDeleted = () => {
    emit('updated');
    emit('close');
};
</script>

<template>
    <VModal
        :is-open="isOpen"
        :origin-el="originEl"
        :layout-id="`manage-habitacion-${habitacion?.id}`"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div v-if="habitacion" class="flex flex-col p-8 w-[520px] max-w-[95vw]">
            <div class="flex flex-col gap-1 mb-6">
                <div class="flex items-center gap-1.5 mb-0.5">
                    <BedDouble :size="16" class="text-white/50" />
                    <span class="text-xs font-semibold text-white/40 tracking-wide">Gestión de Habitaciones</span>
                </div>
                <h2 class="text-2xl font-bold text-white">Editar Habitación</h2>
            </div>

            <form class="flex flex-col gap-4 w-full" @submit.prevent="submitForm">
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
                    <label class="text-xs text-white/50 mb-0.5">Estado</label>
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
                    <label class="text-xs text-white/50 mb-0.5">Categoría</label>
                    <VSelect
                        v-model="form.idCategoria"
                        :options="categoriaOptions"
                        placeholder="Selecciona una categoría"
                    />
                </div>

                <!-- Footer actions -->
                <div class="pt-4 flex justify-between items-center w-full">
                    <button
                        type="button"
                        @click="openConfirmDelete"
                        class="flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer group"
                    >
                        <Trash2 :size="16" class="transition-transform group-hover:scale-110" />
                        Eliminar Habitación
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
                            <Loader v-if="loading" class="animate-spin" :size="16" />
                            <span v-else>Guardar Cambios</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </VModal>

    <HabitacionConfirmDeleteModal
        :is-open="isConfirmDeleteOpen"
        :habitacion="habitacion"
        @close="isConfirmDeleteOpen = false"
        @confirmed="handleDeleted"
    />
</template>
