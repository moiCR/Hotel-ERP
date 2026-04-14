<script setup lang="ts">
import { ref, computed } from 'vue'
import ActivateModal from '@/components/activate/ActivateModal.vue'

definePageMeta({
    layout: false,
});

const route = useRoute();
const token = route.query.token as string | null;

const isModalOpen = ref(false);
const btnRef = ref<any>(null);
const anchorEl = computed(() => btnRef.value?.$el || btnRef.value);

</script>

<template>
    <div class="relative w-[100vw] h-[100vh] bg-[#0a0a0a] overflow-hidden flex items-center justify-center font-sans">
        <ActivateModal
            :is-open="isModalOpen"
            :origin-el="anchorEl"
            :token="token"
            @close="isModalOpen = false"
        />

        <div v-if="!token" class="flex flex-col items-center gap-4 z-10 text-center">
            <h1 class="text-3xl font-bold text-white tracking-tight">Enlace Inválido</h1>
            <p class="text-lg text-white/50 max-w-md">El enlace de activación no es válido, está mal formado o ha expirado.</p>
            <button @click="navigateTo('/login')" class="bg-white/10 hover:bg-white/15 text-white py-3 px-8 rounded-full mt-4 transition-colors font-medium cursor-pointer">
                Regresar al Login
            </button>
        </div>

        <div v-else class="flex flex-col items-center justify-center gap-8 z-10 text-center">
            <div class="flex flex-col gap-2 relative">
                <h1 class="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                    Bienvenido a ERP Hotel
                </h1>
                <p class="text-base md:text-lg text-white/50 mt-2 max-w-lg mx-auto leading-relaxed">
                    Solo falta un paso. Configura tu nueva contraseña para activar tu cuenta de usuario en el sistema.
                </p>
            </div>
            
            <button
                ref="btnRef"
                @click="isModalOpen = true"
                class="bg-white text-black font-semibold text-lg py-4 px-10 rounded-4xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] cursor-pointer mt-4"
            >
                Configurar mi cuenta
            </button>
        </div>
    </div>
</template>