import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { id, nombreCategoria, precio } = body

        if (!id) {
            return { success: false, message: 'ID de categoría requerido.' }
        }

        const parsedId = parseInt(id, 10)

        const existing = await db.categoriaHabitacion.findUnique({
            where: { id: parsedId }
        })

        if (!existing) {
            return { success: false, message: 'Categoría de habitación no encontrada.' }
        }

        const categoria = await db.categoriaHabitacion.update({
            where: { id: parsedId },
            data: {
                nombreCategoria: nombreCategoria?.trim() ?? existing.nombreCategoria,
                precio: precio !== undefined ? parseFloat(precio) : existing.precio
            }
        })

        return { success: true, categoria }

    } catch (error) {
        console.error('Error al actualizar categoría de habitación:', error)
        return { success: false, message: 'Error interno al actualizar la categoría de habitación.' }
    }
})
