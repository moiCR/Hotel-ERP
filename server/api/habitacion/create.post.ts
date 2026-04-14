import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { piso, estado, idSede, idCategoria } = body

        if (piso === undefined || piso === null || !estado || !idSede || !idCategoria) {
            return { success: false, message: 'Todos los campos son obligatorios.' }
        }

        const habitacion = await db.habitacion.create({
            data: {
                piso: parseInt(piso, 10),
                estado: estado.trim(),
                idSede: parseInt(idSede, 10),
                idCategoria: parseInt(idCategoria, 10)
            }
        })

        return { success: true, habitacion }

    } catch (error) {
        console.error('Error al crear habitación:', error)
        return { success: false, message: 'Error interno al crear la habitación.' }
    }
})
