<script setup lang="ts">
import { ref } from 'vue'
import VModal from '@/components/vModal.vue'
import { LogOut, X, Loader } from '@lucide/vue'
import { useAuth } from '~/composables/useAuth'

interface Props {
  isOpen: boolean
  anchorEl?: HTMLElement | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const { logout } = useAuth()
const loading = ref(false)

async function handleLogout() {
  loading.value = true
  try {
    await logout()
    emit('close')
  } catch(error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VModal
    :is-open="props.isOpen"
    :anchor-el="props.anchorEl"
    :origin-el="props.anchorEl"
    @close="emit('close')"
  >
    <div class="flex flex-col gap-6 p-6 w-[360px]">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 text-red-500">
          <div class="p-2 bg-red-500/10 rounded-full">
            <LogOut :size="20" />
          </div>
          <h2 class="text-xl font-semibold">Cerrar Sesión</h2>
        </div>
        <button
          @click="emit('close')"
          class="rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2"
        >
          <X :size="16" class="text-white/50" />
        </button>
      </div>

      <p class="text-sm text-white/70">
        ¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a ingresar tus credenciales para acceder.
      </p>

      <div class="flex gap-3 mt-2">
        <button
          @click="emit('close')"
          class="flex-1 bg-white/5 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="handleLogout"
          :disabled="loading"
          class="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader v-if="loading" class="animate-spin" :size="16" />
          <span v-else>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  </VModal>
</template>
