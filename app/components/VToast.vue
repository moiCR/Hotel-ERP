<script setup lang="ts">
import { useToast } from '#imports';
import { X, CheckCircle, AlertCircle, Info } from '@lucide/vue';
import gsap from 'gsap';

const { toasts, removeToast } = useToast();

const onBeforeEnter = (el: any) => {
    gsap.set(el, { opacity: 0, x: 40, scale: 0.95 });
}

const onEnter = (el: any, done: () => void) => {
    gsap.to(el, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.2)',
        onComplete: done
    });
}

const onLeave = (el: any, done: () => void) => {
    gsap.to(el, {
        opacity: 0,
        x: 20,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: done
    });
}
</script>

<template>
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <TransitionGroup 
            tag="div" 
            class="flex flex-col gap-3"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave"
            :css="false"
        >
            <div 
                v-for="toast in toasts" 
                :key="toast.id"
                class="pointer-events-auto bg-[#181818] border rounded-2xl p-4 pr-12 shadow-2xl flex items-center gap-3 relative min-w-[300px] max-w-[400px]"
                :class="{
                    'border-emerald-500/30 text-emerald-50': toast.type === 'success',
                    'border-red-500/30 text-red-50': toast.type === 'error',
                    'border-brand/30 text-brand-50': toast.type === 'info'
                }"
            >
                <!-- Icon -->
                <div class="shrink-0">
                    <CheckCircle v-if="toast.type === 'success'" class="text-emerald-400" :size="20" />
                    <AlertCircle v-if="toast.type === 'error'" class="text-red-400" :size="20" />
                    <Info v-if="toast.type === 'info'" class="text-brand" :size="20" />
                </div>
                
                <!-- Message -->
                <p class="text-sm font-medium leading-snug">{{ toast.message }}</p>

                <!-- Close Button -->
                <button 
                    @click="removeToast(toast.id)" 
                    class="absolute top-1/2 -translate-y-1/2 right-3 text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                    <X :size="16" />
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>
