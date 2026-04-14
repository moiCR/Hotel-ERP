<script setup lang="ts">
const route = useRoute()
</script>

<template>
    <NuxtLayout name="default">
        <div class="flex flex-col w-full h-full gap-6">
            <header class="flex flex-row gap-3">
                <NuxtLink
                    class="nav-billing-item"
                    to="/dashboard/billing"
                    :class="{
                        'scale-110': route.path.endsWith('/dashboard/billing'),
                        'scale-95': !route.path.endsWith('/dashboard/billing'),
                    }"
                >
                    Caja
                </NuxtLink>
                <NuxtLink
                    class="nav-billing-item"
                    to="/dashboard/billing/reports"
                    :class="{
                        'scale-110': route.path.endsWith('/reports'),
                        'scale-95': !route.path.endsWith('/reports'),
                    }"
                >
                    Informes
                </NuxtLink>
            </header>

            <main class="flex flex-col h-full w-full p-2">
                <slot />
            </main>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.nav-billing-item {
    padding: 10px 20px;
    background-color: #161616;
    border-radius: 32px;
    transition: all 300ms ease-in-out;
    cursor: pointer;
    font-size: 18px;
}

.nav-billing-item:hover {
    scale: 1.05;
}

.nav-billing-item:active {
    scale: 0.95;
}
</style>
