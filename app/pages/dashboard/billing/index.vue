<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { CreditCard, Banknote, HelpCircle, Receipt, Search, CheckCircle, Loader } from '@lucide/vue';
import gsap from 'gsap';

definePageMeta({ layout: 'default' })

const loading = ref(true);
const processing = ref(false);
const pending = ref<any[]>([]);
const config = ref({ IVA: 13, TIPO_CAMBIO: 515 });

const selectedReserva = ref<any>(null);

const montoTarjeta = ref<number | string>('');
const montoEfectivoUSD = ref<number | string>('');
const montoEfectivoColones = ref<number | string>('');
const observaciones = ref('');

const fetchPending = async () => {
    loading.value = true;
    try {
        const [configRes, pendingRes] = await Promise.all([
            fetch('/api/config/all').then(r => r.json()),
            fetch('/api/billing/pending').then(r => r.json())
        ]);
        
        if (configRes.success && configRes.data) {
            config.value = { 
                IVA: parseFloat(configRes.data.IVA) || 13,
                TIPO_CAMBIO: parseFloat(configRes.data.TIPO_CAMBIO) || 515
            };
        }
        if (pendingRes.success) {
            pending.value = pendingRes.data;
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

const selectReserva = (reserva: any) => {
    selectedReserva.value = reserva;
    montoTarjeta.value = '';
    montoEfectivoUSD.value = '';
    montoEfectivoColones.value = '';
    observaciones.value = '';
    
    setTimeout(() => {
        gsap.fromTo('.billing-panel', { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 });
    }, 50);
}

const nights = computed(() => {
    if (!selectedReserva.value) return 0;
    const fInit = new Date(selectedReserva.value.fechaInicio).getTime();
    const fEnd = new Date(selectedReserva.value.fechaSalida).getTime();
    let n = Math.ceil((fEnd - fInit) / (1000 * 60 * 60 * 24));
    return n > 0 ? n : 1;
});

const subtotal = computed(() => {
    if (!selectedReserva.value) return 0;
    return selectedReserva.value.Habitacion.CategoriaHabitacion.precio * nights.value;
});

const totalIva = computed(() => subtotal.value * (config.value.IVA / 100));
const totalPagar = computed(() => subtotal.value + totalIva.value);
const totalDolares = computed(() => totalPagar.value / config.value.TIPO_CAMBIO);

const abonosCalculados = computed(() => {
    const tarjeta = parseFloat(montoTarjeta.value as string) || 0;
    const colones = parseFloat(montoEfectivoColones.value as string) || 0;
    const usd = parseFloat(montoEfectivoUSD.value as string) || 0;
    return {
        tarjeta,
        colones,
        usd,
        usdEnColones: usd * config.value.TIPO_CAMBIO,
        totalAbonado: tarjeta + colones + (usd * config.value.TIPO_CAMBIO)
    }
});

const saldoRestante = computed(() => {
    const saldo = totalPagar.value - abonosCalculados.value.totalAbonado;
    return saldo > 0 ? saldo : 0;
});

const vueltoAEntregar = computed(() => {
    const vuelto = abonosCalculados.value.totalAbonado - totalPagar.value;
    return vuelto > 0 ? vuelto : 0;
});

const isReadyToCheckout = computed(() => {
    return selectedReserva.value && (abonosCalculados.value.totalAbonado >= (totalPagar.value - 0.5));
});

const confirmCheckout = async () => {
    if (!isReadyToCheckout.value) return;
    processing.value = true;
    try {
        const response = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idReserva: selectedReserva.value.id,
                montoEfectivoColones: abonosCalculados.value.colones,
                montoEfectivoDolares: abonosCalculados.value.usd,
                montoTarjeta: abonosCalculados.value.tarjeta,
                vuelto: vueltoAEntregar.value,
                observaciones: observaciones.value
            })
        });
        
        const data = await response.json();
        if (data.success) {
            selectedReserva.value = null;
            await fetchPending();
            const { useToast } = await import('#imports');
            useToast().showToast('¡Pago procesado y habitación desocupada!', 'success');
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || 'Error al facturar', 'error');
        }
    } catch (e) {
        const { useToast } = await import('#imports');
        useToast().showToast('Error de conexión', 'error');
    } finally {
        processing.value = false;
    }
}

const formatCurrency = (val: number, isUsd = false) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: isUsd ? 'USD' : 'CRC' }).format(val);
}

onMounted(() => {
    fetchPending();
});
</script>

<template>
    <div class="h-full flex flex-col">
        <section class="flex justify-between items-end border-b border-gray-200/20 pb-4 shrink-0">
            <section>
                <h1 class="text-3xl text-brand font-bold flex items-center gap-3">
                    <Receipt class="text-brand" :size="28" />
                    Caja y Facturación
                </h1>
                <p class="text-muted-foreground text-gray-500 mt-1">
                    Cierre de reservas, facturación multidivisa y control de caja.
                </p>
            </section>
            
            <div class="flex items-center gap-6 bg-brand/10 border border-brand/20 px-6 py-2 rounded-xl">
                <div class="flex flex-col">
                    <span class="text-[10px] uppercase text-brand/70 font-bold tracking-wider">Tipo de Cambio</span>
                    <span class="text-brand font-mono font-bold">{{ formatCurrency(config.TIPO_CAMBIO) }}</span>
                </div>
                <div class="w-px h-8 bg-brand/20"></div>
                <div class="flex flex-col">
                    <span class="text-[10px] uppercase text-brand/70 font-bold tracking-wider">IVA Global</span>
                    <span class="text-brand font-mono font-bold">{{ config.IVA }}%</span>
                </div>
            </div>
        </section>

        <div v-if="loading" class="flex flex-col justify-center items-center h-48 gap-4 mt-8 flex-1">
            <Loader class="animate-spin text-brand" :size="32" />
        </div>

        <section v-else class="flex flex-1 gap-6 mt-6 overflow-hidden h-[calc(100vh-14rem)]">
            <!-- Left: Pending List -->
            <div class="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 pb-12">
                <div v-if="pending.length === 0" class="text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                    No hay reservas pendientes de facturación en este momento.
                </div>
                
                <div v-for="reserva in pending" :key="reserva.id" 
                     @click="selectReserva(reserva)"
                     class="bg-[#161616] border border-white/5 rounded-3xl p-5 cursor-pointer transition-all duration-300 hover:border-brand/30 select-none flex items-center justify-between mx-1"
                     :class="selectedReserva?.id === reserva.id ? 'border-brand bg-[#1c1c1c] shadow-[0_0_15px_rgba(var(--brand-rgb),0.1)]' : 'hover:bg-[#1f1f1f]'">
                    <div class="flex items-center gap-5">
                        <div class="h-14 w-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-xl shrink-0 transition-colors" :class="selectedReserva?.id === reserva.id ? 'bg-brand text-black border-transparent' : ''">
                            {{ reserva.Habitacion.piso }}0{{ reserva.Habitacion.id % 9 + 1 }}
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-lg font-bold text-gray-100 leading-none">{{ reserva.Habitacion.CategoriaHabitacion.nombreCategoria }}</span>
                            <span class="text-gray-400 text-sm">Cliente: <span class="text-gray-200">{{ reserva.Cliente.nombre }} {{ reserva.Cliente.apellidos }}</span></span>
                            <span class="text-xs text-gray-500 font-mono mt-1">Llegada: {{ new Date(reserva.fechaInicio).toLocaleDateString() }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Checkout Calculator -->
            <div v-if="selectedReserva" class="billing-panel w-[480px] shrink-0 bg-[#161616] border border-white/5 rounded-[2rem] flex flex-col shadow-2xl relative h-full">
                <div class="p-8 bg-gradient-to-br from-brand/10 via-[#161616] to-[#161616] border-b border-white/5 flex flex-col gap-2 shrink-0 rounded-t-[2rem]">
                    <span class="text-brand/80 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Receipt :size="14" /> Total General a Cobrar</span>
                    <h2 class="text-3xl font-bold text-gray-100 flex items-center gap-3">
                        {{ formatCurrency(totalPagar) }}
                        <span class="text-brand/80 text-lg font-mono bg-brand/10 px-3 py-1 rounded-xl ring-1 ring-brand/20 ml-auto">{{ formatCurrency(totalDolares, true) }}</span>
                    </h2>
                </div>

                <div class="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                    <!-- Line Items -->
                    <div class="space-y-4">
                        <div class="flex justify-between text-sm text-gray-400">
                            <span>Alojamiento ({{ nights }} noches)</span>
                            <span class="font-mono text-gray-300">{{ formatCurrency(subtotal) }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-gray-400">
                            <span>IVA ({{ config.IVA }}%)</span>
                            <span class="font-mono text-gray-300">{{ formatCurrency(totalIva) }}</span>
                        </div>
                        <div class="h-px w-full bg-white/10 my-2"></div>
                        <div class="flex justify-between font-bold text-gray-200">
                            <span>Subtotal con Impuestos</span>
                            <span class="font-mono">{{ formatCurrency(totalPagar) }}</span>
                        </div>
                    </div>

                    <!-- Payment Method Mix -->
                    <div class="space-y-4 flex flex-col">
                        <div class="flex items-center gap-3 mb-2">
                            <CreditCard :size="18" class="text-brand" /> 
                            <h3 class="text-sm font-bold text-gray-100 uppercase tracking-widest">Desglose de Pago</h3>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col gap-1.5 col-span-2">
                                <label class="text-xs text-white/50 mb-0.5 font-semibold">Tarjeta (CRC)</label>
                                <input type="number" v-model="montoTarjeta" placeholder="0.00" class="w-full bg-[#1c1c1c] border border-white/5 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-brand/40 transition-colors font-mono placeholder-white/20">
                            </div>
                            
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs text-white/50 mb-0.5 font-semibold">Efectivo ₡</label>
                                <input type="number" v-model="montoEfectivoColones" placeholder="0.00" class="w-full bg-[#1c1c1c] border border-white/5 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-brand/40 transition-colors font-mono placeholder-white/20">
                            </div>

                            <div class="flex flex-col gap-1.5 relative">
                                <label class="text-xs text-white/50 mb-0.5 font-semibold flex items-center justify-between">
                                    Efectivo $
                                    <span class="text-brand/90 font-mono text-[10px]" v-if="abonosCalculados.usd > 0">+ {{ formatCurrency(abonosCalculados.usdEnColones) }}</span>
                                </label>
                                <input type="number" v-model="montoEfectivoUSD" placeholder="0.00" class="w-full bg-[#1c1c1c] border border-white/5 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-brand/40 transition-colors font-mono placeholder-white/20">
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs text-white/50 mb-0.5 font-semibold">Observaciones Internas</label>
                        <textarea v-model="observaciones" rows="2" class="w-full bg-[#1c1c1c] border border-white/5 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-brand/40 transition-colors resize-none placeholder-white/20" placeholder="Ej. Pago con transferencia SINPE..."></textarea>
                    </div>
                </div>

                <!-- Footer Summary Output -->
                <div class="p-8 pb-8 bg-[#1f1f1f]/50 border-t border-white/5 flex flex-col gap-5 shrink-0 rounded-b-[2rem]">
                    <div class="flex justify-between items-center px-2">
                        <div class="flex flex-col" :class="saldoRestante > 0 ? 'text-amber-400' : 'text-gray-500'">
                            <span class="text-[10px] uppercase font-bold tracking-widest">Faltante</span>
                            <span class="text-lg font-mono">{{ formatCurrency(saldoRestante) }}</span>
                        </div>
                        <div class="flex flex-col items-end" :class="vueltoAEntregar > 0 ? 'text-emerald-400' : 'text-gray-500'">
                            <span class="text-[10px] uppercase font-bold tracking-widest">Vuelto A Entregar</span>
                            <span class="text-lg font-mono font-bold">{{ formatCurrency(vueltoAEntregar) }}</span>
                        </div>
                    </div>

                    <button @click="confirmCheckout" :disabled="!isReadyToCheckout || processing" 
                        class="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-black transition-all duration-300"
                        :class="isReadyToCheckout ? 'bg-brand shadow-[0_0_20px_rgba(var(--brand-rgb),0.3)] hover:scale-[1.02] active:scale-95' : 'bg-gray-700 text-gray-400 cursor-not-allowed'">
                        <CheckCircle v-if="!processing" :size="20" />
                        <Loader v-else class="animate-spin" :size="20" />
                        {{ processing ? 'Procesando...' : 'Facturar y Desocupar' }}
                    </button>
                </div>
            </div>
            
            <div v-else class="billing-panel flex-[0.7] bg-[#161616]/50 border border-white/5 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-gray-500 gap-4">
                <Banknote class="opacity-30" :size="48" />
                <p class="text-sm font-medium w-64 text-center">Selecciona una reserva pendiente para iniciar el proceso de cobro.</p>
            </div>
        </section>
    </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
