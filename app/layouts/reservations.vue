<script setup lang="ts">
const route = useRoute()
</script>

<template>
    <NuxtLayout name="default">
        <div class="flex flex-col w-full h-full gap-6">
            <header class="flex flex-row gap-3">
                <NuxtLink
                    class="nav-reservations-item"
                    to="/dashboard/reservations"
                    :class="{
                        'scale-110': route.path.endsWith('/dashboard/reservations'),
                        'scale-95': !route.path.endsWith('/dashboard/reservations'),
                    }"
                >
                    Reservas
                </NuxtLink>
                <NuxtLink
                    class="nav-reservations-item"
                    to="/dashboard/reservations/clients"
                    :class="{
                        'scale-110': route.path.endsWith('/clients'),
                        'scale-95': !route.path.endsWith('/clients'),
                    }"
                >
                    Clientes
                </NuxtLink>
            </header>

            <main class="flex flex-col h-full w-full p-2">
                <slot />
            </main>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.nav-reservations-item {
    padding: 10px 20px;
    background-color: #161616;
    border-radius: 32px;
    transition: all 300ms ease-in-out;
    cursor: pointer;
    font-size: 18px;
}

.nav-reservations-item:hover {
    scale: 1.05;
}

.nav-reservations-item:active {
    scale: 0.95;
}
</style>
