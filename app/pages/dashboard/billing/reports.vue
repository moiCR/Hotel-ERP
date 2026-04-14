<script setup lang="ts">
definePageMeta({
    layout: 'billing'
})
</script>

<template>
    <section class="flex justify-between items-end border-b border-gray-200/20 pb-4">
        <section>
            <h1 class="text-3xl text-brand font-bold">Informes</h1>
            <p class="text-gray-500 mt-1">Módulo en desarrollo</p>
        </section>
    </section>

    <div class="flex flex-col justify-center items-center h-full gap-3 text-gray-500">
        <div class="h-16 w-16 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                class="text-gray-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        </div>
        <p class="text-sm text-gray-600">Este módulo estará disponible próximamente</p>
    </div>
</template>
