<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();

// --- Estado de los datos ---
const loading = ref(true);
const kpis = ref({
    reservasHoy: 0,
    ingresosHoy: 0,
    ocupacionPorcentaje: 0,
    habitacionesOcupadas: 0,
});
const reservasRecientes = ref([]);

// --- Funciones de Fetching ---

/**
 * Simula la obtención de métricas clave (KPIs)
 */
const fetchKpis = async () => {
    // En un entorno real, se llamaría a un endpoint /api/dashboard/kpis
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
    
    // Datos de ejemplo
    kpis.value = {
        reservasHoy: 12,
        ingresosHoy: 5400.50,
        ocupacionPorcentaje: 85,
        habitacionesOcupadas: 45,
    };
};

/**
 * Simula la obtención de las reservas más recientes
 */
const fetchReservasRecientes = async () => {
    // En un entorno real, se llamaría a un endpoint /api/dashboard/reservas-recientes
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia

    // Datos de ejemplo
    reservasRecientes.value = [
        { id: 101, cliente: 'Juan Pérez', checkIn: 'Hoy', checkOut: 'Mañana', habitacion: '201' },
        { id: 102, cliente: 'María Gómez', checkIn: 'Mañana', checkOut: 'Pasado Mañana', habitacion: '105' },
        { id: 103, cliente: 'Carlos Ruiz', checkIn: 'Hoy', checkOut: 'Mañana', habitacion: '302' },
        { id: 104, cliente: 'Laura Díaz', checkIn: 'Hoy', checkOut: 'Mañana', habitacion: '203' },
    ];
};

// --- Ciclo de Vida ---
onMounted(async () => {
    try {
        await Promise.all([
            fetchKpis(),
            fetchReservasRecientes()
        ]);
    } catch (error) {
        toast.value('error', 'No se pudieron cargar los datos del dashboard.');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="p-6 bg-gray-50 min-h-full">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard Principal</h1>

        <!-- 1. KPIs (Key Performance Indicators) -->
        <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            
            <!-- Tarjeta Reservas Hoy -->
            <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 transition duration-300 hover:shadow-xl">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Reservas Hoy</p>
                <p class="text-4xl font-extrabold text-gray-900 mt-1">{{ kpis.reservasHoy }}</p>
                <p class="text-sm text-green-500 mt-2">+2 vs ayer</p>
            </div>

            <!-- Tarjeta Ingresos Hoy -->
            <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 transition duration-300 hover:shadow-xl">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Ingresos Hoy</p>
                <p class="text-4xl font-extrabold text-gray-900 mt-1">${{ kpis.ingresosHoy.toFixed(2) }}</p>
                <p class="text-sm text-green-500 mt-2">+15% vs meta</p>
            </div>

            <!-- Tarjeta Ocupación -->
            <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 transition duration-300 hover:shadow-xl">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Ocupación</p>
                <p class="text-4xl font-extrabold text-gray-900 mt-1">{{ kpis.ocupacionPorcentaje }}%</p>
                <p class="text-sm text-yellow-600 mt-2">45 habitaciones ocupadas</p>
            </div>

            <!-- Tarjeta Habitaciones Disponibles -->
            <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500 transition duration-300 hover:shadow-xl">
                <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Habitaciones Libres</p>
                <p class="text-4xl font-extrabold text-gray-900 mt-1">{{ 100 - kpis.ocupacionPorcentaje }}%</p>
                <p class="text-sm text-red-600 mt-2">15 habitaciones disponibles</p>
            </div>
        </div>

        <!-- 2. Contenido Principal (Widgets) -->
        <div v-if="loading" class="text-center py-10">
            <p class="text-xl text-gray-500">Cargando datos del dashboard...</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Columna 1: Tareas Pendientes / Quick Actions -->
            <div class="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Tareas Pendientes</h2>
                <div class="space-y-4">
                    <!-- Tarea 1 -->
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0 bg-red-500/10 text-red-600 rounded-full p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Check-in Pendiente</p>
                            <p class="text-xs text-gray-500">Cliente: Juan Pérez (Hab. 201)</p>
                        </div>
                    </div>
                    <!-- Tarea 2 -->
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0 bg-yellow-500/10 text-yellow-600 rounded-full p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Factura por Emitir</p>
                            <p class="text-xs text-gray-500">Reserva ID 102 (Pendiente de pago)</p>
                        </div>
                    </div>
                    <!-- Tarea 3 -->
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0 bg-blue-500/10 text-blue-600 rounded-full p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900">Actualizar Inventario</p>
                            <p class="text-xs text-gray-500">Se detectó baja cantidad en la Sede Principal.</p>
                        </div>
                    </div>
                </div>
                <button class="mt-6 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150">
                    Ver Todas las Tareas
                </button>
            </div>

            <!-- Columna 2: Resumen de Reservas Recientes -->
            <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Reservas Recientes</h2>
                
                <div v-if="reservasRecientes.length === 0" class="text-center py-10 text-gray-500">
                    Aún no hay reservas registradas.
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Habitación</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="item in reservasRecientes" :key="item.id">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.id }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.cliente }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{{ item.habitacion }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.checkIn }} - {{ item.checkOut }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <vButton class="mr-2 text-green-600 hover:text-green-900" @click="/* Ver Detalles */">Ver</vButton>
                                    <vButton class="text-indigo-600 hover:text-indigo-900" @click="/* Check-in */">Check-in</vButton>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
