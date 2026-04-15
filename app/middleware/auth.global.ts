export default defineNuxtRouteMiddleware(async (to, from) => {
  const headers = useRequestHeaders(['cookie']) as HeadersInit

  const publicRoutes = ['/login', '/activate']

  try {
    const data = await $fetch<{ authenticated: boolean, payload: any }>('/api/auth/session', {
      headers
    })
    
    const isAuthenticated = data?.authenticated

    if (!isAuthenticated && !publicRoutes.includes(to.path)) {
      return navigateTo('/login')
    }

    if (isAuthenticated && to.path === '/login') {
      return navigateTo('/dashboard')
    }

    if (isAuthenticated && to.path === '/activate') {
      return navigateTo('/dashboard')
    }

    if (isAuthenticated && to.path.startsWith('/dashboard')) {
        const role = String(data.payload?.rol || '').toLowerCase();
        const path = to.path;

        if (path.startsWith('/dashboard/users') || path.startsWith('/dashboard/logs') || path.startsWith('/dashboard/settings')) {
            if (role !== 'administrador' && role !== 'admin' && role !== 'gerente') {
                return navigateTo('/dashboard');
            }
        }

        if (role === 'cajero') {
            if (!path.endsWith('/dashboard') && !path.startsWith('/dashboard/billing') && !path.startsWith('/dashboard/reports') && !path.startsWith('/dashboard/reservations')) {
                return navigateTo('/dashboard');
            }
        }

        if (role === 'recepcionista') {
            if (!path.endsWith('/dashboard') && !path.startsWith('/dashboard/reservations') && !path.startsWith('/dashboard/hotel')) {
                return navigateTo('/dashboard');
            }
        }
    }
  } catch (error) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
  }
})