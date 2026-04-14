<script setup lang="ts">
interface Props {
    to: string;
    active: boolean;
    text: string;
}

const props = defineProps<Props>();
</script>


<template>
    <NuxtLink 
        :to="to"
        class="flex items-center justify-center w-fit px-8 gap-4 bg-[#161616] p-3 rounded-4xl 
            hover:bg-[#202020] transition-all duration-300 hover:scale-105
            "
        :class="{ 'scale-95': active, 'scale-100': !active }"
    >
        <span :class="{ 'text-white': active, 'text-gray-400': !active }">{{ text }}</span>
    </NuxtLink>
</template>