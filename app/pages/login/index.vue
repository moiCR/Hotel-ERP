<script setup lang="ts">
import { ref } from 'vue'
import VButton from '@/components/vButton.vue'
import LoginModal from '@/components/login/LoginModal.vue'
import { Hotel } from '@lucide/vue'

const isModalOpen = ref(false)
const loginBtnEl = ref<HTMLElement | null>(null)

const openModal = () => {
  isModalOpen.value = true
}

definePageMeta({
    layout: false
})

</script>

<template>
  <div class="relative flex justify-center items-center h-full w-full overflow-hidden">

    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-[-15%] left-[-8%]  w-[560px] h-[560px] rounded-full bg-indigo-950/60  blur-[140px]" />
      <div class="absolute bottom-[-15%] right-[-8%] w-[480px] h-[480px] rounded-full bg-violet-950/50  blur-[120px]" />
      <div class="absolute top-[45%] right-[22%]   w-[260px] h-[260px] rounded-full bg-blue-950/40    blur-[80px]"  />
    </div>

    <div class="relative z-10 flex flex-col items-center gap-5 text-center px-6">

      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-white/6 border border-white/8">
            <Hotel class="text-white/75" :size="20" />
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">ERP Hotel</h1>
        </div>
        <p class="text-white/35 text-sm max-w-[280px] leading-relaxed">
          Sistema de gestión integral para la administración hotelera
        </p>
      </div>

      <VButton
        ref="loginBtnEl"
        :class="'rounded-full! px-7'"
        @click="openModal"
      >
        Continuar
      </VButton>

    </div>

  </div>

  <LoginModal
    :is-open="isModalOpen"
    :origin-el="(loginBtnEl as any)?.$el?.querySelector('button') ?? null"
    @close="isModalOpen = false"
  />
</template>