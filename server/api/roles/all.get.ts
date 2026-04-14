export default defineEventHandler(async (event) => {
    try {
        const roles = await db.rol.findMany()
        return { success: true, roles }
    } catch (error) {
        console.error('Error al obtener roles:', error)
        return { success: false, message: 'Error al obtener roles.' }
    }
})