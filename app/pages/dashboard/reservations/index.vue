<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Calendar, Plus, User, BedDouble, Search, CheckCircle, Loader, X, Trash2 } from '@lucide/vue';
import gsap from 'gsap';

import { useToast } from '#imports';

definePageMeta({ layout: 'reservations' })

const { showToast } = useToast();
const reservations = ref<any[]>([]);
const loading = ref(true);

const showWizard = ref(false);
const wizardStep = ref(1); // 1: Fechas, 2: Habitacion, 3: Cliente, 4: Resumen
const fetchingRooms = ref(false);
const saving = ref(false);

const createBtnRef = ref<any>(null);
const wizardOriginEl = computed(() => createBtnRef.value?.$el || createBtnRef.value);

const isDeleteModalOpen = ref(false);
const reservaToDelete = ref<any>(null);
const deleteOriginEl = ref<HTMLElement | null>(null);

const fetchReservations = async () => {
    loading.value = true;
    try {
        const res = await fetch('/api/reservations/all');
        const data = await res.json();
        if (data.success) {
            reservations.value = data.data;
        }
    } catch (e) {
        console.error(e);
        showToast('Error cargando reservas', 'error');
    } finally {
        loading.value = false;
        setTimeout(() => {
            if (document.querySelectorAll('.res-card').length) {
                gsap.fromTo('.res-card', { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.05 });
            }
        }, 50);
    }
}

const openWizard = () => {
    showWizard.value = true;
}

const triggerDelete = (res: any, event: Event) => {
    reservaToDelete.value = res;
    deleteOriginEl.value = event.currentTarget as HTMLElement;
    isDeleteModalOpen.value = true;
}

const onWizardCreated = () => {
    showToast('Reserva registrada exitosamente.', 'success');
    fetchReservations();
}

const onDeleted = () => {
    showToast('Reserva anulada correctamente.', 'info');
    fetchReservations();
}

onMounted(() => {
    fetchReservations();
});
</script>

<template>
    <div class="h-full flex flex-col">
        <section class="flex justify-between items-end border-b border-gray-200/20 pb-4 shrink-0">
            <section>
                <h1 class="text-3xl text-brand font-bold flex items-center gap-3">
                    <Calendar class="text-brand" :size="28" />
                    Reservaciones
                </h1>
                <p class="text-muted-foreground text-gray-500 mt-1">
                    Control de asignaciones, ingresos proyectados y cancelaciones.
                </p>
            </section>
            
            <VButton ref="createBtnRef" @click="openWizard" class="bg-brand text-black">
                <div class="flex items-center gap-2">
                    <Plus :size="18" /> Nueva Reserva
                </div>
            </VButton>
        </section>

        <!-- Current Reservations Grid -->
        <div v-if="loading" class="flex flex-1 items-center justify-center">
            <Loader class="animate-spin text-brand" :size="32" />
        </div>

        <section v-else class="flex flex-col gap-4 mt-8 pb-10 overflow-y-auto">
            <div v-if="reservations.length === 0" class="text-center bg-[#161616]/50 border border-white/5 border-dashed rounded-3xl py-20 text-gray-500">
                No hay reservaciones activas. Haz clic en "Nueva Reserva" para empezar.
            </div>

            <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="res in reservations" :key="res.id" class="res-card bg-[#161616] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-brand/40 group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    
                    <div class="flex justify-between items-start relative z-10">
                        <div class="flex items-center gap-3">
                            <div class="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg ring-2 ring-brand/20">
                                {{ res.Habitacion.piso }}0{{ res.Habitacion.id % 9 + 1 }}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs uppercase text-brand/80 font-bold tracking-widest">{{ res.Habitacion.CategoriaHabitacion.nombreCategoria }}</span>
                                <span class="font-bold text-gray-100">{{ res.Cliente.nombre }} {{ res.Cliente.apellidos }}</span>
                            </div>
                        </div>
                        <button v-if="res.Factura.length === 0" @click="triggerDelete(res, $event)" class="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10" title="Anular Reserva">
                            <Trash2 :size="18" />
                        </button>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mt-2">
                        <div class="flex flex-col gap-1 bg-[#0a0a0a] border border-white/5 p-3 rounded-2xl">
                            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Inicia</span>
                            <span class="text-sm font-mono text-gray-200">{{ new Date(res.fechaInicio).toLocaleDateString() }}</span>
                        </div>
                        <div class="flex flex-col gap-1 bg-[#0a0a0a] border border-white/5 p-3 rounded-2xl">
                            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Termina</span>
                            <span class="text-sm font-mono text-gray-200">{{ new Date(res.fechaSalida).toLocaleDateString() }}</span>
                        </div>
                    </div>
                    
                    <!-- Estado Chip -->
                    <div class="flex mt-2 justify-between items-center">
                        <span v-if="res.Factura.length > 0" class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Pagada
                        </span>
                        <span v-else class="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendiente de Pago
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- New Booking Wizard Modal -->
        <ReservationsReservationWizardModal :is-open="showWizard" :origin-el="wizardOriginEl" @close="showWizard = false" @created="onWizardCreated" />
        
        <!-- Confirm Delete Modal -->
        <ReservationsReservationConfirmDeleteModal 
            :is-open="isDeleteModalOpen" 
            :reserva="reservaToDelete" 
            :origin-el="deleteOriginEl" 
            @close="isDeleteModalOpen = false" 
            @confirmed="onDeleted" 
        />
    </div>
</template>
