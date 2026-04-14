<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Loader, Plus, Search, BedDouble, RefreshCcw, Trash2 } from "@lucide/vue";
import gsap from "gsap";

definePageMeta({
    layout: "sede",
});

const route = useRoute();
const sedeId = computed(() => Number(route.params.sedeId));

const loading = ref(true);
const habitaciones = ref<any[]>([]);
const searchQuery = ref("");

const filteredHabitaciones = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return habitaciones.value;

    return habitaciones.value.filter((h) => {
        const fullText = `${h.piso}0${h.id % 9 + 1} ${h.CategoriaHabitacion?.nombreCategoria} ${h.estado}`.toLowerCase();
        return fullText.includes(query);
    });
});

const fetchHabitaciones = async () => {
    loading.value = true;
    try {
        const response = await fetch(`/api/habitacion/all?sedeId=${sedeId.value}`);
        const data = await response.json();
        if (data.success) {
            habitaciones.value = data.habitaciones;
        }
    } catch (e) {
        console.error("Error al obtener habitaciones:", e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    if (sedeId.value) fetchHabitaciones();
});

// Create Modal
const isCreateModalOpen = ref(false);
const createBtnRef = ref<any>(null);
const createAnchorEl = computed(() => createBtnRef.value?.$el || createBtnRef.value);

// Manage Modal
const isManageModalOpen = ref(false);
const selectedHabitacion = ref<any>(null);
const manageOriginEl = ref<HTMLElement | null>(null);

const openManageModal = (habitacion: any, event: Event) => {
    selectedHabitacion.value = habitacion;
    manageOriginEl.value = event.currentTarget as HTMLElement;
    isManageModalOpen.value = true;
};

// Delete Modal
const isDeleteModalOpen = ref(false);
const habitacionToDelete = ref<any>(null);
const deleteOriginEl = ref<HTMLElement | null>(null);

const openDeleteModal = (habitacion: any, event: Event) => {
    habitacionToDelete.value = habitacion;
    deleteOriginEl.value = event.currentTarget as HTMLElement;
    isDeleteModalOpen.value = true;
};

const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(precio);
};
</script>

<template>
    <div class="flex flex-col h-full w-full mt-4 pb-12 animate-in fade-in">
        <section class="flex justify-between items-end mb-6">
            <section>
                <h1 class="text-2xl font-bold text-white mb-1">Inventario de Habitaciones</h1>
                <p class="text-gray-500 text-sm">Gestiona la disponibilidad, estado y categorías de las habitaciones de esta sede.</p>
            </section>
            
            <section class="flex items-center gap-3">
                <div class="flex items-center gap-3" v-show="!loading">
                    <p v-if="searchQuery" class="text-xs text-gray-500 hidden md:block">
                        {{ filteredHabitaciones.length }} resultados
                    </p>
                    <div class="relative w-64">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Buscar por número o estado..."
                            class="w-full bg-[#161616] hover:bg-[#202020] focus:bg-[#202020] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 shadow-sm border border-white/5"
                        />
                    </div>
                </div>

                <VButton ref="createBtnRef" @click="isCreateModalOpen = true" tooltip="Crear Habitación" tooltip-position="bottom" class="bg-brand text-black font-bold flex items-center gap-2">
                    <Plus :size="18"/> Nueva Habitación
                </VButton>
                
                <VButton @click="fetchHabitaciones" tooltip="Recargar" tooltip-position="bottom">
                    <RefreshCcw :size="18" />
                </VButton>
            </section>
        </section>

        <div v-if="loading" class="flex flex-col justify-center items-center h-full min-h-[300px] gap-2">
            <Loader class="animate-spin text-brand" :size="32" />
        </div>

        <section v-else class="flex flex-col gap-3">
            <div v-if="filteredHabitaciones.length === 0" class="w-full text-center py-16 text-gray-500 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                No hay habitaciones registradas o que coincidan con la búsqueda.
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div
                    v-for="(hab, index) in filteredHabitaciones"
                    :key="hab.id"
                    @click="(e) => openManageModal(hab, e)"
                    class="group relative bg-[#161616] border border-white/10 rounded-3xl p-5 transition-all hover:bg-[#1a1a1a] hover:border-brand/40 cursor-pointer overflow-hidden animate-in zoom-in-95"
                    :style="`animation-delay: ${index * 50}ms`"
                >
                    <div class="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    
                    <div class="flex justify-between items-start z-10 relative">
                        <div class="flex items-center gap-2.5">
                            <div class="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-base border border-brand/20">
                                {{ hab.piso }}0{{ hab.id % 9 + 1 }}
                            </div>
                        </div>
                        
                        <button
                            @click.stop="(e) => openDeleteModal(hab, e)"
                            class="text-gray-500 hover:text-red-400 p-1.5 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                        >
                            <Trash2 :size="16" />
                        </button>
                    </div>

                    <div class="flex flex-col gap-1 mt-4 relative z-10">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500">Categoría</span>
                        <p class="text-sm text-gray-200 truncate">{{ hab.CategoriaHabitacion?.nombreCategoria || 'Sin categoría' }}</p>
                        <p class="text-xs font-mono text-brand/80 mt-0.5">{{ formatPrecio(hab.CategoriaHabitacion?.precio || 0) }}/noche</p>
                    </div>

                    <div class="mt-4 flex pb-1 relative z-10">
                        <span
                            v-if="hab.estado === 'Disponible'"
                            class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Disponible
                        </span>
                        <span
                            v-else-if="hab.estado === 'Ocupada'"
                            class="text-xs bg-brand/10 text-brand/90 border border-brand/20 px-3 py-1 rounded-full font-bold flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></span> Ocupada
                        </span>
                        <span
                            v-else-if="hab.estado === 'Limpieza'"
                            class="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-bold flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Limpieza
                        </span>
                        <span
                            v-else
                            class="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-bold flex items-center gap-1.5"
                        >
                            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> {{ hab.estado }}
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <HotelHabitacionCreateModal
            :is-open="isCreateModalOpen"
            :anchor-el="createAnchorEl"
            @close="isCreateModalOpen = false"
            @created="fetchHabitaciones"
        />

        <HotelHabitacionManageModal
            :is-open="isManageModalOpen"
            :habitacion="selectedHabitacion"
            :origin-el="manageOriginEl"
            @close="isManageModalOpen = false"
            @updated="fetchHabitaciones"
        />

        <HotelHabitacionConfirmDeleteModal
            :is-open="isDeleteModalOpen"
            :habitacion="habitacionToDelete"
            :origin-el="deleteOriginEl"
            @close="isDeleteModalOpen = false"
            @confirmed="fetchHabitaciones"
        />
    </div>
</template>
