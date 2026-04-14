<script setup lang="ts">
import { ref } from "vue";
import { X, UserPlus, Loader } from "@lucide/vue";

interface Rol {
    id: number;
    nombre: string;
}

interface Sede {
    id: number;
    ciudad: string;
    direccion: string;
    central: boolean;
}

const sedes = ref<Sede[]>([]);
const roles = ref<Rol[]>([]);

async function getRoles() {
    const response = await fetch("/api/roles/all");
    const data = await response.json();
    if (data.success) {
        roles.value = data.roles;
    }
}

async function getSedes() {
    const response = await fetch("/api/sede/all");
    const data = await response.json();
    if (data.success) {
        sedes.value = data.sedes;
    }
}

onMounted(async () => {
    await getRoles();
    await getSedes();
});

const props = defineProps<{
    isOpen: boolean;
    anchorEl?: HTMLElement | null;
}>();

const emit = defineEmits<{
    (e: "close"): void;
    (e: "created"): void;
}>();

const form = ref({
    nombre: "",
    email: "",
    password: "",
    rolId: "",
    sedeId: "",
});

const roleOptions = computed(() =>
    roles.value.map((r) => ({ label: r.nombre, value: String(r.id) })),
);
const sedeOptions = computed(() =>
    sedes.value.map((s) => ({
        label: s.ciudad + (s.direccion ? " - " + s.direccion : ""),
        value: String(s.id),
    })),
);

const loading = ref(false);

const submitForm = async () => {
    loading.value = true;
    try {
        const response = await fetch("/api/users/create", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form.value),
        });

        const data = await response.json();

        if (data.success) {
            const { useToast } = await import('#imports');
            useToast().showToast('Usuario creado correctamente', 'success');
            emit("created");
            emit("close");

            form.value = {
                nombre: "",
                email: "",
                password: "",
                rolId: "",
                sedeId: "",
            };
        } else {
            const { useToast } = await import('#imports');
            useToast().showToast(data.message || 'Error al crear el usuario.', 'error');
        }
    } catch (error) {
        const { useToast } = await import('#imports');
        useToast().showToast("Ocurrió un error al crear el usuario.", "error");
    } finally {
        loading.value = false;
    }
};

watch(
    () => props.isOpen,
    (val) => {
        if (!val) {
            form.value = {
                nombre: "",
                email: "",
                password: "",
                rolId: "",
                sedeId: "",
            };
        }
    },
);
</script>

<template>
    <VModal
        :is-open="isOpen"
        :anchor-el="anchorEl"
        :layout-id="'create-user'"
        @close="emit('close')"
        class="bg-[#181818]"
    >
        <button
            @click="emit('close')"
            class="absolute top-4 right-4 rounded-full hover:bg-white/5 transition-colors cursor-pointer duration-300 p-2 z-10"
        >
            <X :size="20" class="text-white/50" />
        </button>

        <div class="flex flex-col p-8 w-105 max-w-[95vw] h-auto">
            <div class="w-full flex flex-col gap-3 mt-2">
                <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-1.5 mb-0.5">
                        <UserPlus :size="16" class="text-white/50" />
                        <span
                            class="text-xs font-semibold text-white/40 tracking-wide"
                            >Gestión de Usuarios</span
                        >
                    </div>
                    <h2 class="text-2xl font-bold text-white">Crear Usuario</h2>
                </div>

                <!-- Form -->
                <form
                    class="flex flex-col gap-3.5 mt-2"
                    @submit.prevent="submitForm"
                >
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Nombre</label
                        >
                        <input
                            v-model="form.nombre"
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Correo Electrónico</label
                        >
                        <input
                            v-model="form.email"
                            type="email"
                            placeholder="juan@ejemplo.com"
                            required
                            class="w-full bg-[#1f1f1f] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                        />
                    </div>

                    <div class="flex flex-col gap-1 w-full z-20">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Rol de Usuario</label
                        >
                        <VSelect
                            v-model="form.rolId"
                            :options="roleOptions"
                            placeholder="Selecciona un rol"
                            class="w-full"
                        />
                    </div>

                    <div class="flex flex-col gap-1 w-full z-10">
                        <label class="text-xs text-white/50 mb-0.5"
                            >Sede Asignada</label
                        >
                        <VSelect
                            v-model="form.sedeId"
                            :options="sedeOptions"
                            placeholder="Selecciona una sede"
                            class="w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="w-full hover:scale-101 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-4xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 text-sm mt-4"
                    >
                        <Loader v-if="loading" class="animate-spin" />
                        <span v-else>Crear Usuario</span>
                    </button>
                </form>
            </div>
        </div>
    </VModal>
</template>
