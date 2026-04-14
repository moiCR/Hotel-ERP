<script setup lang="ts">
import { ChevronLeft, Building2 } from '@lucide/vue'

const route = useRoute()
const sedeId = computed(() => Number(route.params.sedeId))
const sede = ref<{ id: number; ciudad: string; direccion: string; central: boolean } | null>(null)

const fetchSede = async (id: number) => {
    const data = await $fetch<{ success: boolean; sede: any }>(`/api/sede/${id}`)
    if (data.success) sede.value = data.sede
}

onMounted(() => fetchSede(sedeId.value))
watch(sedeId, (id) => fetchSede(id))
</script>

<template>
    <NuxtLayout name="default">
        <div class="flex flex-col w-full h-full gap-6">
            <header class="flex flex-col gap-3">
                <NuxtLink
                    to="/dashboard/hotel"
                    class="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors w-fit text-sm group"
                >
                    <ChevronLeft :size="16" class="group-hover:-translate-x-0.5 transition-transform" />
                    Sedes
                </NuxtLink>

                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <Building2 :size="15" class="text-brand" />
                    </div>
                    <h2 class="text-xl font-bold text-white">{{ sede?.ciudad ?? '...' }}</h2>
                    <span
                        v-if="sede?.central"
                        class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                    >
                        Central
                    </span>
                </div>

                <div class="flex gap-2">
                    <NuxtLink
                        class="nav-sede-item"
                        :to="`/dashboard/hotel/${sedeId}`"
                        :class="{
                            'scale-110': route.path === `/dashboard/hotel/${sedeId}`,
                            'scale-95': route.path !== `/dashboard/hotel/${sedeId}`,
                        }"
                    >
                        Configuración
                    </NuxtLink>
                    <NuxtLink
                        class="nav-sede-item"
                        :to="`/dashboard/hotel/${sedeId}/habitaciones`"
                        :class="{
                            'scale-110': route.path.endsWith('/habitaciones'),
                            'scale-95': !route.path.endsWith('/habitaciones'),
                        }"
                    >
                        Habitaciones
                    </NuxtLink>
                </div>
            </header>

            <main class="flex flex-col h-full w-full p-2">
                <slot />
            </main>
        </div>
    </NuxtLayout>
</template>

<style scoped>
.nav-sede-item {
    padding: 10px 20px;
    background-color: #161616;
    border-radius: 32px;
    transition: all 300ms ease-in-out;
    cursor: pointer;
    font-size: 16px;
}

.nav-sede-item:hover {
    scale: 1.05;
}

.nav-sede-item:active {
    scale: 0.95;
}
</style>
