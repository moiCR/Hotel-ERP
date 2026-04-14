<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { X, Calendar, Loader, CheckCircle, BedDouble } from "@lucide/vue";

const props = defineProps<{
    isOpen: boolean;
    originEl?: HTMLElement | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "created"): void;
}>();

const wizardStep = ref(1);
const fetchingRooms = ref(false);
const saving = ref(false);

const form = ref({
    fechaInicio: '',
    fechaSalida: '',
    idHabitacion: null as number | null,
    idCliente: null as number | null,
    habSeleccionada: null as any,
    clienteSeleccionado: null as any
});

const availableRooms = ref<any[]>([]);
const clientsList = ref<any[]>([]);

const checkAvailability = async () => {
    if (!form.value.fechaInicio || !form.value.fechaSalida) return;
    if (new Date(form.value.fechaInicio) >= new Date(form.value.fechaSalida)) {
        alert("La fecha de salida debe ser posterior a la de inicio.");
        return;
    }
    
    fetchingRooms.value = true;
    try {
        const res = await fetch(`/api/reservations/rooms-available?inicio=${form.value.fechaInicio}&salida=${form.value.fechaSalida}`);
        const data = await res.json();
        if (data.success) {
            availableRooms.value = data.data;
            wizardStep.value = 2; 
        }
    } catch (e) {
        console.error(e);
    } finally {
        fetchingRooms.value = false;
    }
}

const selectRoom = (room: any) => {
    form.value.idHabitacion = room.id;
    form.value.habSeleccionada = room;
    fetchClients();
    wizardStep.value = 3;
}

const fetchClients = async () => {
    try {
        const res = await fetch('/api/clients/all');
        const data = await res.json();
        if (data.success) {
            clientsList.value = data.data;
        }
    } catch (e) {
        console.error(e);
    }
}

const selectClient = (client: any) => {
    form.value.idCliente = client.id;
    form.value.clienteSeleccionado = client;
    wizardStep.value = 4;
}

const createReservation = async () => {
    saving.value = true;
    try {
        const res = await fetch('/api/reservations/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idCliente: form.value.idCliente,
                idHabitacion: form.value.idHabitacion,
                fechaInicio: form.value.fechaInicio,
                fechaSalida: form.value.fechaSalida
            })
        });
        const data = await res.json();
        if (data.success) {
            emit("created");
            emit("close");
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || 'Error al guardar la reserva', 'error');
        }
    } catch (e) {
        const { useToast } = await import('#imports');
        useToast().showToast('Error de conexión con el servidor', 'error');
    } finally {
        saving.value = false;
    }
}

const calculateNights = (inicio: string, salida: string) => {
    const fInit = new Date(inicio).getTime();
    const fEnd = new Date(salida).getTime();
    let n = Math.ceil((fEnd - fInit) / (1000 * 60 * 60 * 24));
    return n > 0 ? n : 1;
};

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(val);
}

const calculateSubtotal = () => {
    if (!form.value.habSeleccionada) return 0;
    return form.value.habSeleccionada.CategoriaHabitacion.precio * calculateNights(form.value.fechaInicio, form.value.fechaSalida);
}

watch(() => props.isOpen, (open) => {
    if (open) {
        wizardStep.value = 1;
        form.value = { fechaInicio: '', fechaSalida: '', idHabitacion: null, idCliente: null, habSeleccionada: null, clienteSeleccionado: null };
    }
});
</script>

<template>
    <VModal
        :is-open="isOpen"
        :origin-el="originEl"
        :layout-id="'reservation-wizard'"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <div class="flex flex-col w-[800px] max-w-[95vw] h-[650px] overflow-hidden">
            <button
                @click="emit('close')"
                class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
            >
                <X :size="20" class="text-white/50" />
            </button>
            
            <div class="p-8 pb-6 border-b border-white/5 shrink-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                    <Calendar :size="16" class="text-white/50" />
                    <span class="text-xs font-semibold text-white/40 tracking-wide">Gestión de Reservas</span>
                </div>
                <h2 class="text-2xl font-bold text-white">Nueva Reserva</h2>
            </div>
            
            <!-- Wizard Steps Header -->
            <div class="flex px-8 shrink-0 bg-[#181818]">
                <div class="flex-1 py-4 border-b-2 text-center text-[10px] font-bold uppercase tracking-widest transition-colors" :class="wizardStep >= 1 ? 'border-white text-white' : 'border-transparent text-white/30'">1. Fechas</div>
                <div class="flex-1 py-4 border-b-2 text-center text-[10px] font-bold uppercase tracking-widest transition-colors" :class="wizardStep >= 2 ? 'border-white text-white' : 'border-transparent text-white/30'">2. Habitación</div>
                <div class="flex-1 py-4 border-b-2 text-center text-[10px] font-bold uppercase tracking-widest transition-colors" :class="wizardStep >= 3 ? 'border-white text-white' : 'border-transparent text-white/30'">3. Cliente</div>
                <div class="flex-1 py-4 border-b-2 text-center text-[10px] font-bold uppercase tracking-widest transition-colors" :class="wizardStep >= 4 ? 'border-white text-white' : 'border-transparent text-white/30'">4. Resumen</div>
            </div>

            <div class="p-8 flex flex-col flex-1 overflow-y-auto">
                <!-- Step 1: Fechas -->
                <div v-if="wizardStep === 1" class="flex flex-col gap-6 animate-in fade-in h-full">
                    <p class="text-white/60 text-sm">Selecciona las fechas de ingreso y salida del huésped.</p>
                    <div class="flex items-center gap-4 mt-2">
                        <div class="flex flex-col gap-1 w-full">
                            <label class="text-xs text-white/50 mb-0.5">Inicio (Check-in)</label>
                            <input v-model="form.fechaInicio" type="date" class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/15 transition-colors [&::-webkit-calendar-picker-indicator]:invert cursor-pointer font-mono">
                        </div>
                        <div class="flex flex-col gap-1 w-full">
                            <label class="text-xs text-white/50 mb-0.5">Salida (Check-out)</label>
                            <input v-model="form.fechaSalida" type="date" class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/15 transition-colors [&::-webkit-calendar-picker-indicator]:invert cursor-pointer font-mono">
                        </div>
                    </div>
                    
                    <div class="mt-auto flex justify-end">
                        <button @click="checkAvailability" :disabled="fetchingRooms || !form.fechaInicio || !form.fechaSalida" class="hover:scale-101 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 px-8 rounded-4xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm mt-4">
                            <Loader v-if="fetchingRooms" class="animate-spin" :size="16"/>
                            <span v-else>Buscar Disponibilidad</span>
                        </button>
                    </div>
                </div>

                <!-- Step 2: Habitación -->
                <div v-if="wizardStep === 2" class="flex flex-col gap-4 animate-in fade-in h-full">
                    <p class="text-white/60 text-sm z-10 sticky top-0 bg-[#181818] pb-2">Resultados para <span class="text-white font-mono font-bold">{{ new Date(form.fechaInicio).toLocaleDateString() }}</span> al <span class="text-white font-mono font-bold">{{ new Date(form.fechaSalida).toLocaleDateString() }}</span>.</p>
                    
                    <div v-if="availableRooms.length === 0" class="flex-1 flex items-center justify-center border border-dashed border-red-500/20 bg-red-500/5 rounded-2xl text-red-400 p-8 text-center text-sm">
                        No hay habitaciones libres en este lapso.
                    </div>
                    
                    <div v-else class="grid grid-cols-2 gap-3 overflow-y-auto pr-2 pb-4">
                        <div v-for="room in availableRooms" :key="room.id" @click="selectRoom(room)" class="bg-[#1f1f1f] border border-white/5 p-5 rounded-2xl cursor-pointer transition-all hover:bg-[#252525] group flex flex-col gap-1.5 hover:scale-[1.01]">
                            <div class="flex justify-between items-center">
                                <span class="text-xl font-bold text-white">{{ room.piso }}0{{ room.id % 9 + 1 }}</span>
                                <span class="text-white/80 font-mono text-sm group-hover:text-white">{{ formatCurrency(room.CategoriaHabitacion.precio) }}</span>
                            </div>
                            <span class="text-xs text-white/50 uppercase tracking-widest font-semibold">{{ room.CategoriaHabitacion.nombreCategoria }}</span>
                        </div>
                    </div>

                    <div class="mt-auto flex justify-start shrink-0 pt-2 border-t border-white/5">
                        <button @click="wizardStep = 1" class="text-white/60 hover:text-white text-sm font-semibold py-2 px-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">Atrás</button>
                    </div>
                </div>

                <!-- Step 3: Cliente -->
                <div v-if="wizardStep === 3" class="flex flex-col gap-4 animate-in fade-in h-full">
                    <div class="flex flex-col gap-2 overflow-y-auto pr-2 -mr-2 max-h-[360px]">
                        <div v-if="clientsList.length === 0" class="text-center py-10 text-white/40 text-sm">No hay clientes en la base de datos..</div>
                        <div v-for="c in clientsList" :key="c.id" @click="selectClient(c)" class="bg-[#1f1f1f] border border-white/5 p-4 rounded-2xl cursor-pointer transition-all hover:bg-[#252525] flex justify-between items-center hover:scale-[1.01]">
                            <div class="flex flex-col gap-0.5">
                                <span class="text-base font-bold text-white">{{ c.nombre }} {{ c.apellidos }}</span>
                                <span class="font-mono text-white/40 text-xs">{{ c.cedula }}</span>
                            </div>
                            <CheckCircle v-if="form.idCliente === c.id" class="text-white" :size="20"/>
                        </div>
                    </div>
                    
                    <div class="mt-auto justify-start flex pt-4 border-t border-white/5 shrink-0">
                        <button @click="wizardStep = 2" class="text-white/60 hover:text-white text-sm font-semibold py-2 px-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">Atrás</button>
                    </div>
                </div>

                <!-- Step 4: Resumen y Confirmación -->
                <div v-if="wizardStep === 4" class="flex flex-col gap-6 animate-in fade-in h-full">
                    <div class="bg-[#1f1f1f] border border-white/5 p-6 rounded-3xl flex flex-col gap-5">
                        <div class="flex flex-col gap-4">
                            <div class="flex justify-between py-2 border-b border-white/5 items-center">
                                <span class="text-white/50 text-xs uppercase tracking-widest font-semibold">Cédula del Titular</span>
                                <span class="font-bold text-white/90 text-sm">{{ form.clienteSeleccionado?.nombre }} {{ form.clienteSeleccionado?.apellidos }}</span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-white/5 items-center">
                                <span class="text-white/50 text-xs uppercase tracking-widest font-semibold">Habitación Asignada</span>
                                <span class="font-bold text-white/90 text-sm flex items-center gap-2">
                                    {{ form.habSeleccionada?.piso }}0{{ form.habSeleccionada?.id % 9 + 1 }} 
                                    <span class="text-[10px] bg-white/10 text-white/80 px-2.5 py-0.5 rounded-full uppercase">{{ form.habSeleccionada?.CategoriaHabitacion.nombreCategoria }}</span>
                                </span>
                            </div>
                            <div class="flex justify-between py-2 border-b border-white/5 items-center">
                                <span class="text-white/50 text-xs uppercase tracking-widest font-semibold">Plazo de Estancia</span>
                                <span class="font-bold text-white/90 text-sm font-mono">{{ new Date(form.fechaInicio).toLocaleDateString() }} - {{ new Date(form.fechaSalida).toLocaleDateString() }}</span>
                            </div>
                        </div>
                        
                        <div class="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/10 mt-2">
                            <span class="text-white font-bold uppercase tracking-widest text-xs">Subtotal Neto</span>
                            <span class="text-xl font-mono font-bold text-white">{{ formatCurrency(calculateSubtotal()) }}</span>
                        </div>
                    </div>

                    <div class="mt-auto flex items-center justify-between pt-4 shrink-0 border-t border-white/5">
                        <button @click="wizardStep = 3" class="text-white/60 hover:text-white text-sm font-semibold py-2 px-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">Atrás</button>
                        <button @click="createReservation" :disabled="saving" class="hover:scale-101 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 px-8 rounded-4xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm">
                            <Loader v-if="saving" class="animate-spin" :size="16"/>
                            <span v-else>Confirmar y Reservar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </VModal>
</template>
