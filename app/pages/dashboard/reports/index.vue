<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { BarChart, Wallet, CreditCard, DollarSign, Calendar, ChevronLeft, ChevronRight, Activity } from '@lucide/vue';
import gsap from 'gsap';

definePageMeta({ layout: 'default' })

const date = ref(new Date().toISOString().split('T')[0]);
const loading = ref(true);
const reportData = ref<any>(null);

const fetchReport = async () => {
    loading.value = true;
    try {
        const response = await fetch(`/api/reports/daily?date=${date.value}`);
        const data = await response.json();
        if (data.success) {
            reportData.value = data.data;
        } else {
            reportData.value = null;
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
        setTimeout(() => {
            gsap.fromTo('.stat-card', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 });
        }, 50);
    }
}

watch(date, () => {
    fetchReport();
});

const adjustDate = (days: number) => {
    const current = new Date(date.value + 'T12:00:00'); // set timezone safe
    current.setDate(current.getDate() + days);
    date.value = current.toISOString().split('T')[0];
}

const isToday = computed(() => date.value === new Date().toISOString().split('T')[0]);

const formatCurrency = (val: number, isUsd = false) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: isUsd ? 'USD' : 'CRC' }).format(val || 0);
}

onMounted(() => {
    fetchReport();
});
</script>

<template>
    <div class="h-full flex flex-col">
        <section class="flex justify-between items-end border-b border-gray-200/20 pb-4 shrink-0">
            <section>
                <h1 class="text-3xl text-brand font-bold flex items-center gap-3">
                    <BarChart class="text-brand" :size="28" />
                    Informes Gerenciales
                </h1>
                <p class="text-muted-foreground text-gray-500 mt-1">
                    Análisis de ventas por tipo de habitación y desglose de pagos diarios.
                </p>
            </section>
            
            <div class="flex items-center gap-2 bg-[#161616] border border-white/10 rounded-xl p-1">
                <button @click="adjustDate(-1)" class="p-2 hover:bg-white/5 rounded-lg text-gray-300 transition-colors">
                    <ChevronLeft :size="20"/>
                </button>
                <div class="relative py-1">
                    <input type="date" v-model="date" class="bg-transparent border-none text-gray-100 font-mono font-bold text-center outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:invert cursor-pointer">
                    <span v-if="isToday" class="absolute -top-1 -right-2 text-[8px] bg-brand text-black px-1.5 py-0.5 rounded font-bold uppercase">Hoy</span>
                </div>
                <button @click="adjustDate(1)" class="p-2 hover:bg-white/5 rounded-lg text-gray-300 transition-colors" :disabled="isToday" :class="isToday ? 'opacity-30 cursor-not-allowed' : ''">
                    <ChevronRight :size="20"/>
                </button>
            </div>
        </section>

        <div v-if="loading" class="flex justify-center items-center h-64 gap-4 mt-8 flex-1">
            <Loader class="animate-spin text-brand" :size="32" />
        </div>

        <section v-else-if="reportData" class="flex flex-col gap-6 mt-6 pb-20">
            
            <!-- Global Metrics -->
            <div class="grid grid-cols-4 gap-6">
                <!-- Total Sales -->
                <div class="stat-card bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/20 rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden shadow-[0_0_30px_rgba(var(--brand-rgb),0.05)]">
                    <div class="h-12 w-12 rounded-full bg-brand/20 flex items-center justify-center">
                        <Activity class="text-brand" :size="24" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs uppercase text-brand/80 font-bold tracking-widest">Ingreso Bruto del Día</span>
                        <span class="text-3xl font-mono font-bold text-white">{{ formatCurrency(reportData.summary.totalGeneral) }}</span>
                    </div>
                    <span class="absolute top-6 right-6 text-2xl font-bold text-white/5">{{ reportData.summary.cantidadFacturas }} txs</span>
                </div>

                <div class="stat-card bg-[#161616] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4">
                    <div class="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <DollarSign :size="24" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs uppercase text-gray-400 font-bold tracking-widest">Efectivo Dólares (Caja)</span>
                        <span class="text-2xl font-mono font-bold text-white">{{ formatCurrency(reportData.summary.totalDolaresEfectivo, true) }}</span>
                    </div>
                </div>

                <div class="stat-card bg-[#161616] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4">
                    <div class="h-12 w-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                        <CreditCard :size="24" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs uppercase text-gray-400 font-bold tracking-widest">Pagos Tarjeta (Voucher)</span>
                        <span class="text-2xl font-mono font-bold text-white">{{ formatCurrency(reportData.summary.totalTarjeta) }}</span>
                    </div>
                </div>

                <div class="stat-card bg-[#161616] border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4">
                    <div class="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Wallet :size="24" />
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs uppercase text-gray-400 font-bold tracking-widest">Efectivo Colones (Caja)</span>
                        <span class="text-2xl font-mono font-bold text-white">{{ formatCurrency(reportData.summary.totalColonesEfectivo) }}</span>
                    </div>
                </div>
            </div>

            <!-- Categories Breakdown -->
            <div class="grid grid-cols-2 gap-6 mt-4">
                <div class="stat-card bg-[#161616] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6">
                    <h3 class="text-lg font-bold text-gray-100 uppercase tracking-wide flex items-center gap-2">Ventas por Tipo de Habitación</h3>
                    <div v-if="reportData.byCategory.length === 0" class="text-gray-500 italic py-10 text-center">No hay registros hoy.</div>
                    <div v-else class="flex flex-col gap-4">
                        <div v-for="cat in reportData.byCategory" :key="cat.categoria" class="flex justify-between items-center bg-[#0a0a0a] p-4 rounded-2xl border border-white/5">
                            <div class="flex flex-col gap-1">
                                <span class="font-bold text-gray-100 flex items-center gap-2">{{ cat.categoria }}</span>
                                <span class="text-xs text-gray-500 font-mono">{{ cat.cantidadDevuelta }} checkout{{ cat.cantidadDevuelta > 1 ? 's' : '' }}</span>
                            </div>
                            <span class="font-mono font-bold text-brand text-lg">{{ formatCurrency(cat.ingresoSubtotal) }}</span>
                        </div>
                    </div>
                </div>

                <div class="stat-card bg-[#161616] border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6">
                    <h3 class="text-lg font-bold text-gray-100 uppercase tracking-wide">Últimas Facturas del Día</h3>
                    <div class="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2">
                        <div v-if="reportData.rawFacturas.length === 0" class="text-gray-500 italic py-10 text-center">Sin actividad reciente.</div>
                        <div v-else v-for="fac in [...reportData.rawFacturas].reverse()" :key="fac.id" class="flex flex-col gap-2 bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                            <div class="flex justify-between w-full items-start">
                                <div class="flex gap-2 items-center">
                                    <span class="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-mono">#FAC-{{fac.id.toString().padStart(4, '0')}}</span>
                                    <span class="text-sm font-bold text-gray-200">Habitación {{fac.Reserva.Habitacion.piso}}0{{fac.Reserva.Habitacion.id % 9 + 1}}</span>
                                </div>
                                <span class="text-xs font-mono text-brand">{{ formatCurrency(fac.total) }}</span>
                            </div>
                            <div class="flex gap-4 text-xs text-gray-500 mt-1">
                                <span v-if="fac.montoTarjeta > 0" class="flex items-center gap-1"><CreditCard :size="12"/> Tarjeta</span>
                                <span v-if="fac.montoEfectivoColones > 0" class="flex items-center gap-1"><Wallet :size="12"/> ₡ Efectivo</span>
                                <span v-if="fac.montoEfectivoDolares > 0" class="flex items-center gap-1"><DollarSign :size="12"/> $ Efectivo</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    </div>
</template>
