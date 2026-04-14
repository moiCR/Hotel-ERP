<script setup lang="ts">
import { ref, watch } from 'vue'
import VModal from '@/components/vModal.vue'
import { X, User, Loader } from '@lucide/vue'

interface Props {
  isOpen: boolean
  originEl?: HTMLElement | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter();

async function handleLogin(){
  loading.value = true
  try{
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      })
    })

    const data = await response.json()

    if(data.success){
      emit('close')
      router.push('/dashboard')
    }else{
      error.value = data.message
    }
  }catch(err){
    error.value = 'Error al iniciar sesión'
  }finally{
    loading.value = false
  }
}

watch(() => props.isOpen, (val) => {
  if (!val) {
    email.value = ''
    password.value = ''
    error.value = ''
  }
})




</script>

<template>
  <VModal
    :is-open="props.isOpen"
    :origin-el="props.originEl"
    :layout-id="'login-btn'"
    @close="emit('close')"
    class="bg-black"
  >
    <button
      @click="emit('close')"
      class="absolute top-4 left-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2"
    >
      <X :size="20" class="text-white/50" />
    </button>
    <div
      class="flex flex-col gap-6 px-10 py-10 w-[1200px] h-[800px] max-w-[100vw] items-center justify-center"
    >
      <div class="w-[500px] flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <User :size="14" class="text-white/50" />
            <span class="text-xs font-semibold text-white/40 tracking-wide">ERP Hotel</span>
          </div>
          <h2 class="text-3xl font-bold text-white">Inicia sesión</h2>
        </div>

        <!-- Form -->
        <form class="flex flex-col gap-3.5" @submit.prevent="handleLogin">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-white/50 mb-0.5">Correo</label>
            <input
              v-model="email"
              type="email"
              placeholder="Escribe tu correo"
              required
              class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-xs text-white/50 mb-0.5">Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="Escoge una contraseña"
              required
              class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full hover:scale-101 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-4xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm mt-1"
          >
            <Loader v-if="loading" class="animate-spin" />
            <span v-else>Iniciar sesión</span>
          </button>

          <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
        </form>
      </div>
    </div>
  </VModal>
</template>
