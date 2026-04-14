<script setup lang="ts">
import { ref, computed } from "vue";
import { Loader, Plus, RefreshCcw, Search, Tag, Trash2 } from "@lucide/vue";

interface Categoria {
    id: number;
    nombreCategoria: string;
    precio: number;
}

definePageMeta({
    layout: "hotel",
});

const loading = ref(true);
const categorias = ref<Categoria[]>([]);
const searchQuery = ref("");

const filteredCategorias = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return categorias.value;
    return categorias.value.filter((c) =>
        c.nombreCategoria.toLowerCase().includes(query),
    );
});

const formatCRC = (amount: number): string => {
    return new Intl.NumberFormat("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Create modal
const isCreateModalOpen = ref(false);
const createBtnRef = ref<any>(null);
const createAnchorEl = computed(
    () => createBtnRef.value?.$el || createBtnRef.value,
);

// Delete modal
const isDeleteModalOpen = ref(false);
const categoriaToDelete = ref<Categoria | null>(null);
const deleteOriginEl = ref<HTMLElement | null>(null);

const confirmDeleteAction = (categoria: Categoria, event: Event) => {
    categoriaToDelete.value = categoria;
    deleteOriginEl.value = event.currentTarget as HTMLElement;
    isDeleteModalOpen.value = true;
};

const fetchCategorias = async () => {
    loading.value = true;
    const response = await fetch("/api/categoriaHabitacion/all");
    const data = await response.json();
    categorias.value = data.categorias ?? [];
    loading.value = false;
};

onMounted(async () => {
    await fetchCategorias();
});
</script>

<template>
    <section
        class="flex justify-between items-end border-b border-gray-200/20 pb-4"
    >
        <section>
            <h1 class="text-3xl text-brand font-bold">Categorías</h1>
            <p class="text-gray-500 mt-1">
                Administra las categorías de habitaciones
            </p>
        </section>
        <section class="flex items-center gap-3">
            <div class="flex items-center gap-3" v-show="!loading">
                <p
                    v-if="searchQuery"
                    class="text-xs text-gray-500 hidden md:block"
                >
                    {{ filteredCategorias.length }} resultados
                </p>
                <div class="relative w-65">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        :size="16"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar por nombre de categoría..."
                        class="w-full bg-[#161616] hover:bg-[#202020] focus:bg-[#202020] rounded-4xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>

            <VButton
                ref="createBtnRef"
                :tooltip="'Crear Categoría'"
                :tooltip-position="'bottom'"
                @click="isCreateModalOpen = true"
            >
                <Plus />
            </VButton>
            <VButton
                :tooltip="'Recargar'"
                :tooltip-position="'bottom'"
                @click="fetchCategorias"
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

    <HotelCategoriaCreateModal
        :is-open="isCreateModalOpen"
        :anchor-el="createAnchorEl"
        @close="isCreateModalOpen = false"
        @created="fetchCategorias"
    />

    <HotelCategoriaConfirmDeleteModal
        :is-open="isDeleteModalOpen"
        :categoria="categoriaToDelete"
        :origin-el="deleteOriginEl"
        @close="isDeleteModalOpen = false"
        @confirmed="fetchCategorias"
    />

    <section v-if="!loading" class="mt-6 pb-12">
        <div
            v-if="filteredCategorias.length === 0"
            class="w-full text-center py-10 text-gray-500 bg-white/5 rounded-2xl border border-white/5"
        >
            No se encontraron categorías coincidiendo con la búsqueda.
        </div>

        <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            <div
                v-for="(categoria, index) in filteredCategorias"
                :key="categoria.id"
                class="categoria-card-animated group relative bg-[#161616] rounded-3xl p-6 flex flex-col gap-4 hover:bg-[#202020] hover:scale-[1.02] transition-all duration-300"
                :style="`animation-delay: ${index * 60}ms;`"
            >
                <!-- Header: icon + id / delete btn -->
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2">
                        <div
                            class="h-9 w-9 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0"
                        >
                            <Tag :size="16" class="text-brand" />
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                                >ID</span
                            >
                            <span class="text-xs text-gray-400 font-mono"
                                >#{{ categoria.id }}</span
                            >
                        </div>
                    </div>

                    <button
                        @click="confirmDeleteAction(categoria, $event)"
                        class="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-xl flex items-center justify-center bg-red-500/0 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all duration-200"
                        :title="`Eliminar ${categoria.nombreCategoria}`"
                    >
                        <Trash2 :size="15" />
                    </button>
                </div>

                <!-- Category name -->
                <div class="flex flex-col gap-1">
                    <span
                        class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                        >Nombre</span
                    >
                    <p
                        class="text-gray-100 font-semibold text-base leading-tight truncate"
                    >
                        {{ categoria.nombreCategoria }}
                    </p>
                </div>

                <!-- Precio -->
                <div class="flex flex-col gap-1">
                    <span
                        class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                        >Precio / noche</span
                    >
                    <p
                        class="text-brand font-semibold text-sm font-mono tracking-wide"
                    >
                        ₡ {{ formatCRC(categoria.precio) }}
                    </p>
                </div>

                <!-- Footer -->
                <div class="h-px bg-white/5 mt-auto" />
                <div class="flex items-center justify-between">
                    <span
                        class="text-[10px] text-gray-600 uppercase tracking-widest"
                        >Categoría</span
                    >
                    <div class="w-1.5 h-1.5 rounded-full bg-brand/60"></div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.categoria-card-animated {
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
