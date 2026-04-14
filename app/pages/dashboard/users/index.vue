<script setup lang="ts">
import { ref, computed } from "vue";
import { Loader, Plus, RefreshCcw, Search, Trash2 } from "@lucide/vue";
import gsap from "gsap";
import UserConfirmDeleteModal from "@/components/users/UserConfirmDeleteModal.vue";

interface User {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    contrasena: string | null;
    isActive: boolean;
    activationToken: string | null;
    createdAt: string;
    Rol: {
        nombre: string;
    };
    Sede?: {
        ciudad: string;
        direccion: string;
    };
}

definePageMeta({
    layout: "users",
});

const loading = ref(true);

const users = ref<User[]>([]);
const searchQuery = ref("");

const filteredUsers = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return users.value;

    return users.value.filter((u) => {
        const fullText =
            `${u.nombre} ${u.apellidos} ${u.Rol?.nombre || ""} ${u.Sede?.ciudad || ""}`.toLowerCase();
        return fullText.includes(query);
    });
});

const isCreateModalOpen = ref(false);
const createBtnRef = ref<any>(null);
const createAnchorEl = computed(
    () => createBtnRef.value?.$el || createBtnRef.value,
);

const isManageModalOpen = ref(false);
const selectedUser = ref<User | null>(null);
const manageOriginEl = ref<HTMLElement | null>(null);

const openManageModal = (user: User, event: Event) => {
    selectedUser.value = user;
    manageOriginEl.value = event.currentTarget as HTMLElement;
    isManageModalOpen.value = true;
};

const fetchUsers = async () => {
    loading.value = true;
    const response = await fetch("/api/users/all");
    const data = await response.json();
    users.value = data;
    loading.value = false;
};

const isDeleteModalOpen = ref(false);
const userToDelete = ref<User | null>(null);
const deleteOriginEl = ref<HTMLElement | null>(null);

const confirmDeleteAction = (user: User, event: Event) => {
    userToDelete.value = user;
    deleteOriginEl.value = event.currentTarget as HTMLElement;
    isDeleteModalOpen.value = true;
};

// Lógica de arrastre
const activeDragId = ref<number | null>(null);
const dragX = ref(0);
let startDragX = 0;
let isDragging = false;

const onDragStart = (id: number, e: MouseEvent | TouchEvent) => {
    activeDragId.value = id;
    const clientX = "touches" in e ? e.touches[0]?.clientX || 0 : e.clientX;
    startDragX = clientX;
    isDragging = false;

    const onMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentX =
            "touches" in moveEvent
                ? moveEvent.touches[0]?.clientX || 0
                : moveEvent.clientX;
        const deltaX = currentX - startDragX;

        if (Math.abs(deltaX) > 5) {
            isDragging = true;
            // Solo permitir arrastrar hacia la izquierda (valor negativo)
            dragX.value = Math.min(0, deltaX);
        }
    };

    const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchmove", onMouseMove);
        window.removeEventListener("touchend", onMouseUp);

        if (isDragging) {
            if (dragX.value < -120) {
                // Disparar acción de borrar
                const el = document.querySelector(
                    `[data-user-id="${id}"]`,
                ) as HTMLElement;
                if (el) {
                    const user = filteredUsers.value.find((u) => u.id === id);
                    if (user) {
                        userToDelete.value = user;
                        deleteOriginEl.value = el;
                        isDeleteModalOpen.value = true;
                    }
                }
            }

            // Animación de regreso
            gsap.to(dragX, {
                value: 0,
                duration: 0.4,
                ease: "elastic.out(1, 0.75)",
                onComplete: () => {
                    activeDragId.value = null;
                    isDragging = false;
                },
            });
        } else {
            activeDragId.value = null;
        }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onMouseMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);
};

const handleUserAction = (user: User, event: MouseEvent | TouchEvent) => {
    if (!isDragging) {
        openManageModal(user, event);
    }
};

onMounted(async () => {
    await fetchUsers();
});
</script>

<template>
    <section
        class="flex justify-between items-end border-b border-gray-200/20 pb-4"
    >
        <section>
            <h1 class="text-3xl text-brand font-bold">Usuarios</h1>
            <p class="text-muted-foreground text-gray-500 mt-1">
                Administra los usuarios del sistema
            </p>
        </section>
        <section class="flex items-center gap-3">
            <div class="flex items-center gap-3" v-show="!loading">
                <p
                    v-if="searchQuery"
                    class="text-xs text-gray-500 hidden md:block"
                >
                    {{ filteredUsers.length }} resultados
                </p>
                <div class="relative w-70">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        :size="16"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar por usuario, sede o rol..."
                        class="w-full bg-[#161616] hover:bg-[#202020] focus:bg-[#202020] rounded-4xl pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>

            <VButton
                ref="createBtnRef"
                :tooltip="'Crear Usuario'"
                :tooltip-position="'bottom'"
                @click="isCreateModalOpen = true"
            >
                <Plus />
            </VButton>
            <VButton
                :tooltip="'Recargar'"
                :tooltip-position="'bottom'"
                @click="fetchUsers"
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

    <UsersUserCreateModal
        :is-open="isCreateModalOpen"
        :anchor-el="createAnchorEl"
        @close="isCreateModalOpen = false"
        @created="fetchUsers"
    />

    <UsersUserManageModal
        :is-open="isManageModalOpen"
        :user="selectedUser"
        :origin-el="manageOriginEl"
        @close="isManageModalOpen = false"
        @updated="fetchUsers"
    />

    <UserConfirmDeleteModal
        :is-open="isDeleteModalOpen"
        :user="userToDelete"
        :origin-el="deleteOriginEl"
        @close="isDeleteModalOpen = false"
        @confirmed="fetchUsers"
    />

    <section v-if="!loading" class="flex flex-col mt-6 gap-3 pb-12">
        <div
            v-if="filteredUsers.length === 0"
            class="w-full text-center py-10 text-gray-500 bg-white/5 rounded-2xl border border-white/5"
        >
            No se encontraron usuarios coincidiendo con la búsqueda.
        </div>
        <div
            v-for="(user, index) in filteredUsers"
            :key="user.id"
            :data-user-id="user.id"
            @mousedown="onDragStart(user.id, $event)"
            @touchstart="onDragStart(user.id, $event)"
            @click="handleUserAction(user, $event)"
            class="user-card-animated group relative px-8 py-4 bg-[#161616] rounded-4xl transition-all duration-300 cursor-pointer hover:bg-[#202020] hover:scale-[1.02] flex items-center justify-between select-none"
            :style="`animation-delay: ${index * 80}ms; transform: translateX(${activeDragId === user.id ? dragX : 0}px); z-index: ${activeDragId === user.id ? 10 : 1};`"
        >
            <div
                class="absolute inset-y-0 right-0 flex items-center justify-end px-8 bg-red-500/20 rounded-4xl pointer-events-none transition-opacity duration-300"
                :style="`width: ${Math.abs(dragX)}px; opacity: ${activeDragId === user.id ? Math.min(1, Math.abs(dragX) / 100) : 0};`"
            >
                <Trash2
                    :size="20"
                    class="text-red-500"
                    :style="`transform: scale(${Math.min(1.2, Math.abs(dragX) / 100)})`"
                />
            </div>

            <div class="flex items-center gap-4 w-1/3 min-w-62.5 relative">
                <div
                    class="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex justify-center items-center text-gray-100 font-semibold shadow-inner shrink-0"
                >
                    {{
                        user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"
                    }}
                </div>

                <div class="flex flex-col gap-0.5 overflow-hidden">
                    <p class="text-gray-100 font-medium text-base truncate">
                        {{ user.nombre }} {{ user.apellidos }}
                    </p>
                    <p class="text-gray-400 text-sm truncate">
                        {{ user.email }}
                    </p>
                </div>
            </div>

            <!-- New fields container -->
            <div class="flex items-center gap-6 flex-1 px-4">
                <div
                    class="flex flex-col items-start gap-1 md:flex min-w-30"
                >
                    <span
                        class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                        >Estado</span
                    >
                    <span
                        v-if="user.isActive"
                        class="inline-flex items-center gap-1.5 text-xs text-emerald-400"
                    >
                        <span
                            class="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        ></span>
                        Activo
                    </span>
                    <span
                        v-else-if="user.activationToken"
                        class="inline-flex items-center gap-1.5 text-xs text-amber-400"
                    >
                        <span
                            class="w-1.5 h-1.5 rounded-full bg-amber-400"
                        ></span>
                        Pendiente
                    </span>
                    <span
                        v-else
                        class="inline-flex items-center gap-1.5 text-xs text-red-400"
                    >
                        <span
                            class="w-1.5 h-1.5 rounded-full bg-red-400"
                        ></span>
                        Inactivo
                    </span>
                </div>

                <div
                    class="flex-col items-start gap-1 hidden lg:flex min-w-[100px]"
                >
                    <span
                        class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                        >Contraseña</span
                    >
                    <span v-if="user.contrasena" class="text-xs text-gray-300"
                        >Configurada</span
                    >
                    <span v-else class="text-xs text-amber-400/80 italic"
                        >No configurada</span
                    >
                </div>

                <div
                    class="flex flex-col items-start gap-1 lg:flex min-w-[100px]"
                >
                    <span
                        class="text-[10px] uppercase tracking-wider font-semibold text-gray-500"
                        >Sede</span
                    >
                    <span class="text-xs text-gray-300 truncate">{{
                        user.Sede?.ciudad || "General"
                    }}</span>
                </div>
            </div>

            <div class="flex items-center gap-4 shrink-0">
                <span
                    class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full border border-white/10 bg-white/5 text-gray-300 tracking-wide"
                >
                    {{ user.Rol?.nombre || "Sin Rol" }}
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
        </div>
    </section>
</template>

<style scoped>
.user-card-animated {
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
