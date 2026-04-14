<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { clearError } from 'nuxt/app';
import gsap from 'gsap';

const props = defineProps({
  error: Object
})

const router = useRouter();

const handleError = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    clearError();
    router.back();
  } else {
    clearError({ redirect: '/' });
  }
}

const title = ref(null);
const message = ref(null);
const button = ref(null);

onMounted(() => {
    gsap.fromTo(title.value, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(message.value, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );
    gsap.fromTo(button.value, 
        { y: 20, opacity: 0, scale: 0.9 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.4, ease: "back.out(1.7)" }
    );
});


</script>

<template>
  <div class="absolute inset-0 z-999 bg-background text-white flex flex-col items-center justify-center p-8 overflow-hidden">
    
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-[120px] pointer-events-none"></div>

    <div ref="content" class="z-10 flex flex-col items-center text-center max-w-none w-full">
      <h1 ref="title" class="text-[12rem] md:text-[15rem] font-bold text-transparent bg-clip-text bg-linear-to-br from-white to-gray-500 drop-shadow-2xl leading-none">
        {{ error?.statusCode === 404 ? '404' : error?.statusCode || 'Error' }}
      </h1>
      
      <div class="h-8"></div>

      <h2 ref="message" class="text-2xl font-light text-gray-400 leading-relaxed max-w-2xl">
        <span v-if="error?.statusCode === 404">Parece que te has perdido. La página que buscas no existe.</span>
        <span v-else>Algo salió mal. {{ error?.message }}</span>
      </h2>
      
      <div class="h-20"></div>

      <VButton 
        ref="button"
        @click="handleError"
        class="flex items-center justify-center px-12 py-4 bg-white text-black rounded-full font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
      >
        Volver al inicio
      </VButton>
    </div>
  </div>
</template>

