import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { nombreCategoria, precio } = body

        if (!nombreCategoria || precio === undefined || precio === null) {
            return { success: false, message: 'Nombre de categoría y precio son obligatorios.' }
        }

        const categoria = await db.categoriaHabitacion.create({
            data: {
                nombreCategoria: nombreCategoria.trim(),
                precio: parseFloat(precio)
            }
        })

        return { success: true, categoria }

    } catch (error) {
        console.error('Error al crear categoría de habitación:', error)
        return { success: false, message: 'Error interno al crear la categoría de habitación.' }
    }
})
