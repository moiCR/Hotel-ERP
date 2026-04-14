import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const sedes = await db.sede.findMany()
        return { success: true, sedes }
    } catch (error) {
        console.error('Error al obtener sedes:', error)
        return { success: false, message: 'Error al obtener sedes.' }
    }
})