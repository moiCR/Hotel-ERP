<script setup lang="ts">
import Sidebar from "~/components/sidebar/Sidebar.vue";
const { fetchUser, checkRole, hasPermission } = useAuth();

await fetchUser();

const route = useRoute();
</script>

<template>
    <div class="flex h-screen w-full">
        <Sidebar>
            <SidebarItem
                to="/dashboard"
                :active="
                    route.path === '/dashboard' || route.path === '/dashboard/'
                "
                text="Inicio"
            />

            <SidebarItem
                v-if="hasPermission('usuarios')"
                to="/dashboard/users"
                :active="route.path.startsWith('/dashboard/users')"
                text="Usuarios"
            />

            <SidebarItem
                v-if="hasPermission('hotel')"
                to="/dashboard/hotel"
                :active="route.path.startsWith('/dashboard/hotel')"
                text="Hotel"
            />

            <SidebarItem
                v-if="hasPermission('reservas')"
                to="/dashboard/reservations"
                :active="route.path.startsWith('/dashboard/reservations')"
                text="Reservas"
            />

            <SidebarItem
                v-if="hasPermission('facturacion')"
                to="/dashboard/billing"
                :active="route.path.startsWith('/dashboard/billing')"
                text="Facturación"
            />

            <SidebarItem
                v-if="hasPermission('reportes')"
                to="/dashboard/reports"
                :active="route.path.startsWith('/dashboard/reports')"
                text="Reportes"
            />

            <SidebarItem
                v-if="hasPermission('bitacora')"
                to="/dashboard/logs"
                :active="route.path.startsWith('/dashboard/logs')"
                text="Bitácora"
            />

            <SidebarItem
                v-if="hasPermission('ajustes')"
                to="/dashboard/settings"
                :active="route.path.startsWith('/dashboard/settings')"
                text="Ajustes"
            />
        </Sidebar>

        <div class="flex-1 py-24 px-8 pr-32 overflow-auto h-full w-full">
            <slot />
        </div>
    </div>
</template>
