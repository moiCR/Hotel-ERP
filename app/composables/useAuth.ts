export const useAuth = () => {
  const user = useState<{ nombre: string, rol: string, permisos: string[] } | null>('auth_user', () => null)

  const fetchUser = async () => {
    const { data } = await useFetch<{ authenticated: boolean, payload: any }>('/api/auth/session')
    if (data.value?.authenticated) {
      user.value = {
        nombre: data.value.payload.nombre,
        rol: data.value.payload.rol,
        permisos: data.value.payload.permisos || []
      }
    }
  }

  const checkRole = (roleName: string | string[]): boolean => {
    if (!user.value) return false

    if (Array.isArray(roleName)) {
      return roleName.includes(user.value.rol)
    }

    return user.value.rol === roleName
  }

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user.value) return false
    
    if (Array.isArray(permission)) {
      return permission.some(p => user.value?.permisos?.includes(p))
    }
    
    return user.value.permisos?.includes(permission)
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    useRouter().push('/login')
  }

  return {
    user,
    fetchUser,
    checkRole,
    hasPermission,
    logout
  }
}