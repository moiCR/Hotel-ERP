import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const categorias = await db.categoriaHabitacion.findMany()
        return { success: true, categorias }
    } catch (error) {
        console.error('Error al obtener categorías de habitación:', error)
        return { success: false, message: 'Error al obtener categorías de habitación.' }
    }
})
