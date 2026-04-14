<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Users, Search, Plus, UserPlus, X, Loader } from '@lucide/vue';
import gsap from 'gsap';

definePageMeta({ layout: 'reservations' })

const clients = ref<any[]>([]);
const loading = ref(true);
const saving = ref(false);
const searchQuery = ref('');
const showModal = ref(false);
const addBtnRef = ref<any>(null);
const createAnchorEl = computed(() => addBtnRef.value?.$el || addBtnRef.value);

const fetchClients = async () => {
    loading.value = true;
    try {
        const res = await fetch('/api/clients/all');
        const data = await res.json();
        if (data.success) clients.value = data.data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
        setTimeout(() => {
            gsap.fromTo('.client-card', { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.05 });
        }, 50);
    }
}

const filteredClients = computed(() => {
    const q = searchQuery.value.toLowerCase();
    if (!q) return clients.value;
    return clients.value.filter(c => 
        c.nombre.toLowerCase().includes(q) || 
        c.apellidos.toLowerCase().includes(q) || 
        c.cedula.toLowerCase().includes(q)
    );
});

const openModal = () => {
    showModal.value = true;
}

onMounted(() => {
    fetchClients();
});
</script>

<template>
    <div class="h-full flex flex-col">
        <section class="flex justify-between items-end border-b border-gray-200/20 pb-4 shrink-0">
            <section>
                <h1 class="text-3xl text-brand font-bold flex items-center gap-3">
                    <Users class="text-brand" :size="28" />
                    Cartera de Clientes
                </h1>
                <p class="text-muted-foreground text-gray-500 mt-1">
                    Administración de perfiles y frecuencia de hospedaje.
                </p>
            </section>
            
            <div class="flex items-center gap-4">
                <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
                    <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, cédula..." class="bg-[#161616] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm w-64 text-gray-100 outline-none focus:border-brand/40 transition-colors">
                </div>
                <VButton ref="addBtnRef" @click="openModal" class="bg-brand text-black">
                    <div class="flex items-center gap-2">
                        <Plus :size="18" /> Añadir Cliente
                    </div>
                </VButton>
            </div>
        </section>

        <div v-if="loading" class="flex flex-1 items-center justify-center">
            <Loader class="animate-spin text-brand" :size="32" />
        </div>

        <section v-else class="flex flex-col gap-4 mt-8 pb-10 overflow-y-auto">
            <div v-if="filteredClients.length === 0" class="text-center bg-[#161616]/50 border border-white/5 border-dashed rounded-3xl py-20 text-gray-500">
                No hay clientes registrados que coincidan con la búsqueda.
            </div>

            <!-- Client List (TableView imitation using flex) -->
            <div v-else class="flex flex-col gap-2">
                <!-- Header -->
                <div class="flex px-6 py-3 text-xs uppercase tracking-widest font-bold text-gray-500">
                    <div class="flex-[0.5]">Cédula</div>
                    <div class="flex-[1.5]">Nombre Completo</div>
                    <div class="flex-1 text-center">Viajes</div>
                    <div class="w-10"></div>
                </div>

                <!-- Rows -->
                <div v-for="c in filteredClients" :key="c.id" class="client-card flex items-center bg-[#161616] border border-white/5 hover:border-brand/30 rounded-2xl px-6 py-4 transition-all">
                    <div class="flex-[0.5] font-mono text-gray-400">{{ c.cedula }}</div>
                    <div class="flex-[1.5] text-gray-100 font-bold text-lg">{{ c.nombre }} {{ c.apellidos }}</div>
                    <div class="flex-1 flex justify-center">
                        <span class="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold">{{ c._count.Reserva }} Reservas</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- New Client Modal -->
        <ReservationsClientCreateModal :is-open="showModal" @close="showModal = false" :anchor-el="createAnchorEl" @created="fetchClients" />
    </div>
</template>
