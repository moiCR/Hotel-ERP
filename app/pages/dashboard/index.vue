<script setup lang="ts">
import { Building2, Users, CalendarDays, Banknote, BarChart3, FileText, Settings, UserCircle2 } from '@lucide/vue'

const { user, hasPermission } = useAuth()

const quickLinks = computed(() => {
    const links = []
    
    if (hasPermission('reservas')) {
        links.push({
            name: 'Reservas',
            description: 'Gestionar reservas y clientes',
            icon: CalendarDays,
            to: '/dashboard/reservations',
            color: 'bg-blue-500/10 text-blue-400',
            borderColor: 'border-white/5',
            hoverBorder: 'hover:border-blue-500/30'
        })
    }
    
    if (hasPermission('facturacion')) {
        links.push({
            name: 'Facturación',
            description: 'Gestión de pagos y facturas',
            icon: Banknote,
            to: '/dashboard/billing',
            color: 'bg-emerald-500/10 text-emerald-400',
            borderColor: 'border-white/5',
            hoverBorder: 'hover:border-emerald-500/30'
        })
    }
    
    if (hasPermission('usuarios')) {
        links.push({
            name: 'Usuarios',
            description: 'Administración de personal',
            icon: Users,
            to: '/dashboard/users',
            color: 'bg-purple-500/10 text-purple-400',
            borderColor: 'border-white/5',
            hoverBorder: 'hover:border-purple-500/30'
        })
    }
    
    if (hasPermission('hotel')) {
        links.push({
            name: 'Hotel',
            description: 'Habitaciones y tarifas',
            icon: Building2,
            to: '/dashboard/hotel',
            color: 'bg-orange-500/10 text-orange-400',
            borderColor: 'border-white/5',
            hoverBorder: 'hover:border-orange-500/30'
        })
    }
    
    if (hasPermission('reportes')) {
        links.push({
            name: 'Reportes',
            description: 'Estadísticas e informes',
            icon: BarChart3,
            to: '/dashboard/reports',
            color: 'bg-pink-500/10 text-pink-400',
            borderColor: 'border-white/5',
            hoverBorder: 'hover:border-pink-500/30'
        })
    }
    
    if (hasPermission('bitacora')) {
        links.push({
            name: 'Bitácora',
            description: 'Registro de actividades',
            icon: FileText,
            to: '/dashboard/logs',
            color: 'bg-slate-500/10 text-slate-300',
            borderColor: 'border-white/5',
            hoverBorder: 'hover:border-slate-500/30'
        })
    }
    
    if (hasPermission('ajustes')) {
        links.push({
            name: 'Ajustes',
            description: 'Configuración general',
            icon: Settings,
            to: '/dashboard/settings',
            color: 'bg-zinc-500/10 text-zinc-400',
            borderColor: 'border-white/5',
            hoverBorder: 'hover:border-zinc-500/30'
        })
    }
    
    return links
})
</script>

<template>
    <div class="space-y-8 animate-fade-in w-full max-w-7xl mx-auto pb-12">
        <!-- Header / Welcome -->
        <div class="bg-[#161616] rounded-4xl p-8 sm:p-10 shadow-sm border border-white/5 relative overflow-hidden">
            <div class="absolute -top-12 -right-12 p-8 opacity-5 pointer-events-none transform rotate-12">
                <Building2 class="w-64 h-64 text-white" />
            </div>
            
            <div class="relative z-10">
                <h1 class="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 flex items-center gap-3">
                    Hola, {{ user?.nombre }}
                </h1>
                <div class="flex items-center gap-2 text-gray-400 bg-white/5 w-fit px-4 py-2 rounded-2xl border border-white/5">
                    <UserCircle2 class="w-5 h-5 text-gray-500" />
                    <span>Has iniciado sesión como</span>
                    <span class="font-semibold text-gray-200 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        {{ user?.rol }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Quick Links -->
        <div>
            <h2 class="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2 px-2">
                Accesos Rápidos
                <span class="text-sm font-normal text-gray-500">({{ quickLinks.length }} disponibles para tu rol)</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <NuxtLink 
                    v-for="(link, index) in quickLinks" 
                    :key="link.name"
                    :to="link.to"
                    class="group bg-[#161616] p-6 rounded-4xl border transition-all duration-300 hover:bg-[#202020] hover:scale-[1.02] flex flex-col items-start gap-5 cursor-pointer card-animated"
                    :class="[link.borderColor, link.hoverBorder]"
                    :style="`animation-delay: ${index * 80}ms;`"
                >
                    <div class="p-4 rounded-3xl transition-transform duration-300 group-hover:scale-110" :class="link.color">
                        <component :is="link.icon" class="w-7 h-7" />
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-200 mb-1.5 text-lg group-hover:text-white transition-colors">{{ link.name }}</h3>
                        <p class="text-sm text-gray-500 line-clamp-2">{{ link.description }}</p>
                    </div>
                </NuxtLink>
            </div>
        </div>
        
        <!-- Role Specific Cards -->
        <div v-if="hasPermission('ajustes') || hasPermission('usuarios')" class="bg-purple-500/5 border border-purple-500/20 rounded-4xl p-8 shadow-sm hover:border-purple-500/40 transition-colors">
            <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div class="text-purple-400 bg-purple-500/10 p-4 rounded-3xl shadow-sm h-fit">
                    <BarChart3 class="w-8 h-8" />
                </div>
                <div>
                    <h3 class="text-purple-100 font-bold text-xl mb-2">Panel Administrativo</h3>
                    <p class="text-purple-200/60 mb-5 max-w-2xl leading-relaxed">
                        Como {{ user?.rol }}, tienes permisos administrativos. Puedes ver estadísticas, 
                        gestionar usuarios, configurar el hotel y auditar las acciones en la bitácora.
                    </p>
                    <NuxtLink v-if="hasPermission('reportes')" to="/dashboard/reports" class="inline-flex items-center justify-center rounded-2xl text-sm font-bold py-3 px-6 bg-purple-600 text-white hover:bg-purple-500 shadow-md hover:shadow-lg transition-all duration-200">
                        Ver Reportes
                    </NuxtLink>
                </div>
            </div>
        </div>

        <div v-else-if="hasPermission('facturacion')" class="bg-emerald-500/5 border border-emerald-500/20 rounded-4xl p-8 shadow-sm hover:border-emerald-500/40 transition-colors">
            <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div class="text-emerald-400 bg-emerald-500/10 p-4 rounded-3xl shadow-sm h-fit">
                    <Banknote class="w-8 h-8" />
                </div>
                <div>
                    <h3 class="text-emerald-100 font-bold text-xl mb-2">Centro de Facturación</h3>
                    <p class="text-emerald-200/60 mb-5 max-w-2xl leading-relaxed">
                        Tienes acceso a la gestión de cobros y emisión de comprobantes.
                        Revisa los pagos pendientes y procesa las facturas de los huéspedes de forma segura.
                    </p>
                    <NuxtLink to="/dashboard/billing" class="inline-flex items-center justify-center rounded-2xl text-sm font-bold py-3 px-6 bg-emerald-600 text-white hover:bg-emerald-500 shadow-md hover:shadow-lg transition-all duration-200">
                        Ir a Facturación
                    </NuxtLink>
                </div>
            </div>
        </div>

        <div v-else-if="hasPermission('reservas')" class="bg-blue-500/5 border border-blue-500/20 rounded-4xl p-8 shadow-sm hover:border-blue-500/40 transition-colors">
            <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div class="text-blue-400 bg-blue-500/10 p-4 rounded-3xl shadow-sm h-fit">
                    <CalendarDays class="w-8 h-8" />
                </div>
                <div>
                    <h3 class="text-blue-100 font-bold text-xl mb-2">Centro de Recepción</h3>
                    <p class="text-blue-200/60 mb-5 max-w-2xl leading-relaxed">
                        Tu función incluye gestionar las reservas y la atención a los huéspedes. 
                        Desde aquí puedes ver la disponibilidad, registrar llegadas (check-in) y salidas (check-out).
                    </p>
                    <NuxtLink to="/dashboard/reservations" class="inline-flex items-center justify-center rounded-2xl text-sm font-bold py-3 px-6 bg-blue-600 text-white hover:bg-blue-500 shadow-md hover:shadow-lg transition-all duration-200">
                        Ir a Reservas
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-animated {
    opacity: 0;
    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from { 
        opacity: 0; 
    }
    to { 
        opacity: 1; 
    }
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
