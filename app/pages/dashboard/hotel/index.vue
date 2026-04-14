<script setup lang="ts">
import { Loader, Plus, RefreshCcw, Search, Building2 } from "@lucide/vue";

interface Sede {
    id: number;
    ciudad: string;
    direccion: string;
    central: boolean;
}

definePageMeta({
    layout: "hotel",
});

const loading = ref(true);
const sedes = ref<Sede[]>([]);
const searchQuery = ref("");

const filteredSedes = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return sedes.value;
    return sedes.value.filter((s) => {
        const fullText = `${s.ciudad} ${s.direccion}`.toLowerCase();
        return fullText.includes(query);
    });
});

// Create modal
const isCreateModalOpen = ref(false);
const createBtnRef = ref<any>(null);
const createAnchorEl = computed(
    () => createBtnRef.value?.$el || createBtnRef.value,
);

const fetchSedes = async () => {
    loading.value = true;
    const data = await $fetch<{ success: boolean; sedes: Sede[] }>(
        "/api/sede/all",
    );
    sedes.value = data.sedes ?? [];
    loading.value = false;
};

onMounted(async () => {
    await fetchSedes();
});
</script>

<template>
    <section
        class="flex justify-between items-end border-b border-gray-200/20 pb-4"
    >
        <section>
            <h1 class="text-3xl text-brand font-bold">Sedes</h1>
            <p class="text-gray-500 mt-1">Administra las sedes del hotel</p>
        </section>
        <section class="flex items-center gap-3">
            <div class="flex items-center gap-3" v-show="!loading">
                <p
                    v-if="searchQuery"
                    class="text-xs text-gray-500 hidden md:block"
                >
                    {{ filteredSedes.length }} resultados
                </p>
                <div class="relative w-[280px]">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        :size="16"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar por ciudad o dirección..."
                        class="w-full bg-[#161616] hover:bg-[#202020] focus:bg-[#202020] rounded-4xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>

            <VButton
                ref="createBtnRef"
                :tooltip="'Crear Sede'"
                :tooltip-position="'bottom'"
                @click="isCreateModalOpen = true"
            >
                <Plus />
            </VButton>
            <VButton
                :tooltip="'Recargar'"
                :tooltip-position="'bottom'"
                @click="fetchSedes"
            >
                <RefreshCcw />
            </VButton>
        </section>
    </section>

    <div
        v-if="loading"
        class="flex flex-col justify-center items-center h-full gap-2"
    >
        <Loader class="animate-spin" :size="24" />
        <p>Cargando...</p>
    </div>

    <HotelSedeCreateModal
        :is-open="isCreateModalOpen"
        :anchor-el="createAnchorEl"
        @close="isCreateModalOpen = false"
        @created="fetchSedes"
    />

    <section v-if="!loading" class="flex flex-col mt-6 gap-3 pb-12">
        <div
            v-if="filteredSedes.length === 0"
            class="w-full text-center py-10 text-gray-500 bg-white/5 rounded-2xl border border-white/5"
        >
            No se encontraron sedes coincidiendo con la búsqueda.
        </div>

        <NuxtLink
            v-for="(sede, index) in filteredSedes"
            :key="sede.id"
            :to="`/dashboard/hotel/${sede.id}`"
            class="sede-card-animated group relative px-8 py-4 bg-[#161616] rounded-4xl transition-all duration-300 cursor-pointer hover:bg-[#202020] hover:scale-[1.02] flex items-center justify-between select-none"
            :style="`animation-delay: ${index * 80}ms;`"
        >
            <!-- Left: icon + ciudad + dirección -->
            <div class="flex items-center gap-4 w-1/3 min-w-[220px]">
                <div
                    class="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex justify-center items-center text-gray-100 shrink-0"
                >
                    <Building2 :size="18" class="text-brand" />
                </div>
                <div class="flex flex-col gap-0.5 overflow-hidden">
                    <p class="text-gray-100 font-medium text-base truncate">
                        {{ sede.ciudad }}
                    </p>
                    <p class="text-gray-400 text-sm truncate">
                        {{ sede.direccion }}
                    </p>
                </div>
            </div>

            <!-- Middle fields -->
            <div class="flex items-center gap-6 flex-1 px-4">
                <div
                    class="hidden md:flex flex-col items-start gap-1 min-w-[140px]"
                >
                    <span
                        class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                        >Dirección</span
                    >
                    <span
                        class="text-xs text-gray-300 truncate max-w-[200px]"
                        >{{ sede.direccion }}</span
                    >
                </div>
            </div>

            <!-- Right: Central badge + chevron -->
            <div class="flex items-center gap-4 shrink-0">
                <span
                    v-if="sede.central"
                    class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 tracking-wide"
                >
                    <span
                        class="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    ></span>
                    Central
                </span>
                <span
                    v-else
                    class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-gray-400 tracking-wide"
                >
                    Sucursal
                </span>

                <div
                    class="text-gray-500 group-hover:text-gray-200 transition-colors duration-300 transform group-hover:translate-x-1"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </div>
            </div>
        </NuxtLink>
    </section>
</template>

<style scoped>
.sede-card-animated {
    opacity: 0;
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>
