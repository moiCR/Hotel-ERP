<script setup lang="ts">
import { ref } from "vue";
import LogoutModal from "~/components/LogoutModal.vue";

const isLogoutModalOpen = ref(false);
const logoutBtnRef = ref<HTMLElement | null>(null);
</script>

<template>
    <aside
        class="w-87.5 bg-background text-white p-4 h-full relative flex items-center"
    >
        <div class="flex flex-col gap-2 items-start justify-center w-full">
            <slot />
        </div>

        <button
            ref="logoutBtnRef"
            @click="isLogoutModalOpen = true"
            class="absolute w-fit bottom-4 left-4 right-4 flex items-center justify-center px-8 gap-4 bg-red-500/10 text-red-500 p-3 rounded-4xl hover:bg-red-500/20 transition-all duration-300 hover:scale-105 font-medium cursor-pointer"
        >
            Cerrar Sesión
        </button>

        <LogoutModal
            :is-open="isLogoutModalOpen"
            :anchor-el="logoutBtnRef"
            @close="isLogoutModalOpen = false"
        />
    </aside>
</template>
