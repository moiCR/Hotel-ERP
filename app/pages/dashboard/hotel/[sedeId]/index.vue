<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Save, Loader } from "@lucide/vue";

definePageMeta({
    layout: "sede",
});

const route = useRoute();
const sedeId = computed(() => Number(route.params.sedeId));

const form = ref({
    id: 0,
    ciudad: "",
    direccion: "",
    central: false,
});

const loading = ref(true);
const saving = ref(false);
const saveMessage = ref("");
const errorMessage = ref("");

const fetchSede = async () => {
    loading.value = true;
    try {
        const data = await $fetch<{ success: boolean; sede: any }>(`/api/sede/${sedeId.value}`);
        if (data.success && data.sede) {
            form.value = {
                id: data.sede.id,
                ciudad: data.sede.ciudad,
                direccion: data.sede.direccion,
                central: data.sede.central,
            };
        }
    } catch (e) {
        console.error("Error cargando sede:", e);
    } finally {
        loading.value = false;
    }
};

const saveSede = async () => {
    saving.value = true;
    saveMessage.value = "";
    errorMessage.value = "";
    
    try {
        const data = await $fetch<{ success: boolean; message?: string }>("/api/sede/update", {
            method: "PUT",
            body: {
                id: form.value.id,
                ciudad: form.value.ciudad,
                direccion: form.value.direccion,
                central: form.value.central,
            },
        });
        
        if (data.success) {
            saveMessage.value = "Configuración actualizada correctamente.";
            setTimeout(() => { saveMessage.value = ""; }, 3000);
        } else {
            errorMessage.value = data.message || "Error al actualizar la sede.";
        }
    } catch (e) {
        errorMessage.value = "Error de conexión al guardar.";
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    if (sedeId.value) fetchSede();
});

watch(sedeId, () => {
    if (sedeId.value) fetchSede();
});
</script>

<template>
    <div class="flex flex-col gap-6 animate-in fade-in duration-300 w-full max-w-2xl mt-4">
        <section>
            <h1 class="text-2xl font-bold text-white mb-1">Configuración General</h1>
            <p class="text-gray-500 text-sm">Modifica los detalles principales de esta sucursal.</p>
        </section>

        <div v-if="loading" class="flex justify-center py-20">
            <Loader class="animate-spin text-brand" :size="32" />
        </div>

        <form v-else @submit.prevent="saveSede" class="bg-[#161616] border border-white/5 p-8 rounded-4xl flex flex-col gap-6 shadow-xl">
            <div v-if="saveMessage" class="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl text-sm font-medium border border-emerald-500/20 text-center">
                {{ saveMessage }}
            </div>
            
            <div v-if="errorMessage" class="bg-red-500/10 text-red-500 p-4 rounded-2xl text-sm font-medium border border-red-500/20 text-center">
                {{ errorMessage }}
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-xs uppercase tracking-widest text-gray-400 font-semibold pl-1">Ciudad</label>
                <input
                    v-model="form.ciudad"
                    type="text"
                    required
                    placeholder="Ej. San José"
                    class="w-full bg-[#1f1f1f] border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 outline-none focus:border-brand/40 transition-colors"
                />
            </div>

            <div class="flex flex-col gap-2">
                <label class="text-xs uppercase tracking-widest text-gray-400 font-semibold pl-1">Dirección Exacta</label>
                <input
                    v-model="form.direccion"
                    type="text"
                    required
                    placeholder="Ej. 200m Sur de la iglesia central..."
                    class="w-full bg-[#1f1f1f] border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 outline-none focus:border-brand/40 transition-colors"
                />
            </div>

            <div class="flex items-center justify-between bg-[#1f1f1f] border border-white/5 p-4 py-3.5 rounded-2xl mt-2">
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-white">Sede Central</span>
                    <span class="text-xs text-gray-500">Define si es la ubicación base del hotel.</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="form.central" class="sr-only peer">
                    <div class="w-11 h-6 bg-[#161616] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/80 transition-colors border border-white/10"></div>
                </label>
            </div>

            <div class="pt-4 border-t border-white/5 mt-2 flex justify-end">
                <VButton type="submit" :disabled="saving" class="bg-brand text-black">
                    <div class="flex items-center gap-2">
                        <Loader v-if="saving" class="animate-spin" :size="18"/>
                        <Save v-else :size="18" /> 
                        <span v-if="!saving">Guardar Cambios</span>
                        <span v-else>Guardando...</span>
                    </div>
                </VButton>
            </div>
        </form>
    </div>
</template>
