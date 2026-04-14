<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Save, Settings as SettingsIcon, AlertCircle } from '@lucide/vue';
import gsap from 'gsap';

definePageMeta({
    layout: 'default'
})

const loading = ref(true);
const saving = ref(false);
const iva = ref('13');
const tipoCambio = ref('515');
const message = ref({ text: '', type: '' });

const fetchConfig = async () => {
    loading.value = true;
    try {
        const response = await fetch('/api/config/all');
        const data = await response.json();
        if (data.success && data.data) {
            iva.value = data.data.IVA;
            tipoCambio.value = data.data.TIPO_CAMBIO;
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
        setTimeout(() => {
            gsap.fromTo('.settings-form', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
        }, 100);
    }
}

const saveConfig = async () => {
    saving.value = true;
    message.value = { text: '', type: '' };
    try {
        const response = await fetch('/api/config/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ iva: iva.value, tipoCambio: tipoCambio.value })
        });
        const data = await response.json();
        
        if (data.success) {
            message.value = { text: 'Configuración guardada exitosamente.', type: 'success' };
        } else {
            message.value = { text: data.message || 'Error al guardar. Verifica tus permisos.', type: 'error' };
        }
    } catch (e) {
        message.value = { text: 'Error interno o de conexión.', type: 'error' };
    } finally {
        saving.value = false;
        setTimeout(() => message.value = { text: '', type: '' }, 5000);
    }
}

onMounted(() => {
    fetchConfig();
})
</script>

<template>
    <section class="flex justify-between items-end border-b border-gray-200/20 pb-4">
        <section>
            <h1 class="text-3xl text-brand font-bold flex items-center gap-3">
                <SettingsIcon class="text-brand" :size="28" />
                Configuración del Sistema
            </h1>
            <p class="text-muted-foreground text-gray-500 mt-1">
                Ajustes globales de impuestos y divisas (Operación Administrativa).
            </p>
        </section>
    </section>

    <div v-if="loading" class="flex justify-center py-20">
        <Loader class="animate-spin" :size="32" />
    </div>

    <section v-else class="settings-form max-w-2xl mx-auto mt-12 bg-[#161616] border border-white/5 p-8 rounded-4xl relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col gap-6">
            <div class="flex flex-col gap-2">
                <label class="text-gray-200 font-semibold text-sm tracking-wide uppercase">IVA (%)</label>
                <div class="relative">
                    <input type="number" v-model="iva" class="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-gray-100 outline-none focus:border-brand/50 transition-colors text-lg font-mono">
                    <span class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p class="text-xs text-gray-500">Impuesto al valor agregado que se cargará sobre la tarifa neta de la habitación.</p>
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-gray-200 font-semibold text-sm tracking-wide uppercase">Tipo de Cambio Dólar (₡)</label>
                <div class="relative">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">₡</span>
                    <input type="number" v-model="tipoCambio" class="w-full bg-[#1c1c1c] border border-white/10 rounded-2xl py-4 pl-10 pr-5 text-gray-100 outline-none focus:border-brand/50 transition-colors text-lg font-mono">
                </div>
                <p class="text-xs text-gray-500">Valor de tipo de cambio oficial para pagos y vueltos mixtos en ventanilla.</p>
            </div>

            <div class="pt-4 flex justify-between items-center">
                <div>
                    <transition name="fade">
                        <div v-if="message.text" class="flex items-center gap-2 text-sm font-medium" :class="message.type === 'error' ? 'text-red-400' : 'text-emerald-400'">
                            <AlertCircle :size="16" />
                            {{ message.text }}
                        </div>
                    </transition>
                </div>
                <button 
                    @click="saveConfig"
                    :disabled="saving"
                    class="bg-brand text-black hover:bg-brand/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-semibold px-8 py-3 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(var(--brand-rgb),0.3)]"
                >
                    <Save :size="18" />
                    {{ saving ? 'Guardando...' : 'Guardar Ajustes' }}
                </button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
