<script setup lang="ts">
import { ref, computed } from "vue";
import {
    Loader,
    Plus,
    RefreshCcw,
    Search,
    Trash2,
    ShieldCheck,
} from "@lucide/vue";

interface Rol {
    id: number;
    nombre: string;
}

definePageMeta({
    layout: "users",
});

const loading = ref(true);
const roles = ref<Rol[]>([]);
const searchQuery = ref("");

const filteredRoles = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return roles.value;
    return roles.value.filter((r) => r.nombre.toLowerCase().includes(query));
});

// Create modal
const isCreateModalOpen = ref(false);
const createBtnRef = ref<any>(null);
const createAnchorEl = computed(
    () => createBtnRef.value?.$el || createBtnRef.value,
);

// Delete modal
const isDeleteModalOpen = ref(false);
const rolToDelete = ref<Rol | null>(null);
const deleteOriginEl = ref<HTMLElement | null>(null);

const confirmDeleteAction = (rol: Rol, event: Event) => {
    rolToDelete.value = rol;
    deleteOriginEl.value = event.currentTarget as HTMLElement;
    isDeleteModalOpen.value = true;
};

const fetchRoles = async () => {
    loading.value = true;
    const response = await fetch("/api/roles/all");
    const data = await response.json();
    roles.value = data.roles ?? [];
    loading.value = false;
};

onMounted(async () => {
    await fetchRoles();
});
</script>

<template>
    <section
        class="flex justify-between items-end border-b border-gray-200/20 pb-4"
    >
        <section>
            <h1 class="text-3xl text-brand font-bold">Roles</h1>
            <p class="text-muted-foreground text-gray-500 mt-1">
                Administra los roles del sistema
            </p>
        </section>
        <section class="flex items-center gap-3">
            <div class="flex items-center gap-3" v-show="!loading">
                <p
                    v-if="searchQuery"
                    class="text-xs text-gray-500 hidden md:block"
                >
                    {{ filteredRoles.length }} resultados
                </p>
                <div class="relative w-[260px]">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        :size="16"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar por nombre de rol..."
                        class="w-full bg-[#161616] hover:bg-[#202020] focus:bg-[#202020] rounded-4xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>

            <VButton
                ref="createBtnRef"
                :tooltip="'Crear Rol'"
                :tooltip-position="'bottom'"
                @click="isCreateModalOpen = true"
            >
                <Plus />
            </VButton>
            <VButton
                :tooltip="'Recargar'"
                :tooltip-position="'bottom'"
                @click="fetchRoles"
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

    <UsersRolCreateModal
        :is-open="isCreateModalOpen"
        :anchor-el="createAnchorEl"
        @close="isCreateModalOpen = false"
        @created="fetchRoles"
    />

    <UsersRolConfirmDeleteModal
        :is-open="isDeleteModalOpen"
        :rol="rolToDelete"
        :origin-el="deleteOriginEl"
        @close="isDeleteModalOpen = false"
        @confirmed="fetchRoles"
    />

    <section v-if="!loading" class="mt-6 pb-12">
        <div
            v-if="filteredRoles.length === 0"
            class="w-full text-center py-10 text-gray-500 bg-white/5 rounded-2xl border border-white/5"
        >
            No se encontraron roles coincidiendo con la búsqueda.
        </div>

        <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
            <div
                v-for="(rol, index) in filteredRoles"
                :key="rol.id"
                class="role-card-animated group relative bg-[#161616] rounded-3xl p-6 flex flex-col gap-4 hover:bg-[#202020] hover:scale-[1.02] transition-all duration-300"
                :style="`animation-delay: ${index * 60}ms;`"
            >
                <!-- Header: icon + id / delete btn -->
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2">
                        <div
                            class="h-9 w-9 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0"
                        >
                            <ShieldCheck :size="16" class="text-brand" />
                        </div>
                        <div class="flex flex-col">
                            <span
                                class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                                >ID</span
                            >
                            <span class="text-xs text-gray-400 font-mono"
                                >#{{ rol.id }}</span
                            >
                        </div>
                    </div>

                    <button
                        @click="confirmDeleteAction(rol, $event)"
                        class="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-xl flex items-center justify-center bg-red-500/0 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all duration-200"
                        :title="`Eliminar ${rol.nombre}`"
                    >
                        <Trash2 :size="15" />
                    </button>
                </div>

                <!-- Role name -->
                <div class="flex flex-col gap-1">
                    <span
                        class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                        >Nombre</span
                    >
                    <p
                        class="text-gray-100 font-semibold text-base leading-tight truncate"
                    >
                        {{ rol.nombre }}
                    </p>
                </div>

                <!-- Footer -->
                <div class="h-px bg-white/5 mt-auto" />
                <div class="flex items-center justify-between">
                    <span
                        class="text-[10px] text-gray-600 uppercase tracking-widest"
                        >Rol del sistema</span
                    >
                    <div
                        class="w-1.5 h-1.5 rounded-full bg-emerald-500/60"
                    ></div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.role-card-animated {
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
