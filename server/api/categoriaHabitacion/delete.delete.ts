import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { id } = body

        if (!id) {
            return { success: false, message: 'ID de categoría requerido.' }
        }

        const parsedId = parseInt(id, 10)

        const categoria = await db.categoriaHabitacion.findUnique({
            where: { id: parsedId }
        })

        if (!categoria) {
            return { success: false, message: 'Categoría de habitación no encontrada.' }
        }

        await db.categoriaHabitacion.delete({
            where: { id: parsedId }
        })

        return { success: true, message: 'Categoría de habitación eliminada correctamente.' }

    } catch (error) {
        console.error('Error al eliminar categoría de habitación:', error)
        return { success: false, message: 'Error interno al intentar eliminar la categoría de habitación.' }
    }
})
