export const useAuth = () => {
  const user = useState<{ nombre: string, rol: string } | null>('auth_user', () => null)

  const fetchUser = async () => {
    const { data } = await useFetch<{ authenticated: boolean, payload: any }>('/api/auth/session')
    if (data.value?.authenticated) {
      user.value = {
        nombre: data.value.payload.nombre,
        rol: data.value.payload.rol
      }
    }
  }

  const checkRole = (roleName: string | string[]): boolean => {
    if (!user.value) return false

    // Si pasas un array de roles: checkRole(['Administrador', 'Gerente'])
    if (Array.isArray(roleName)) {
      return roleName.includes(user.value.rol)
    }

    // Si pasas un solo string: checkRole('Administrador')
    return user.value.rol === roleName
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
    logout
  }
}