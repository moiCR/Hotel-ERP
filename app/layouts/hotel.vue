<script setup lang="ts">
const route = useRoute();
</script>

<template>
    <NuxtLayout name="default">
        <div class="flex flex-col w-full h-full gap-6">
            <header class="flex flex-row gap-3">
                <NuxtLink
                    class="nav-hotel-item"
                    to="/dashboard/hotel"
                    :class="{
                        'scale-110': route.path === '/dashboard/hotel',
                        'scale-95': route.path !== '/dashboard/hotel',
                    }"
                >
                    Sedes
                </NuxtLink>
                <NuxtLink
                    class="nav-hotel-item"
                    to="/dashboard/hotel/categories"
                    :class="{
                        'scale-110': route.path.endsWith('/categories'),
                        'scale-95': !route.path.endsWith('/categories'),
                    }"
                >
                    Categorías
                </NuxtLink>
            </header>

            <main class="flex flex-col h-full w-full p-2">
                <slot />
            </main>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.nav-hotel-item {
    padding: 10px 20px;
    background-color: #161616;
    border-radius: 32px;
    transition: all 300ms ease-in-out;
    cursor: pointer;
    font-size: 18px;
}

.nav-hotel-item:hover {
    scale: 1.05;
}

.nav-hotel-item:active {
    scale: 0.95;
}
</style>
