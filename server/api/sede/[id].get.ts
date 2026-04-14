import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id') ?? '0', 10)
    if (!id) return { success: false, message: 'ID requerido.' }

    const sede = await db.sede.findUnique({ where: { id } })
    if (!sede) return { success: false, message: 'Sede no encontrada.' }

    return { success: true, sede }
  } catch (error) {
    console.error('Error al obtener sede:', error)
    return { success: false, message: 'Error interno.' }
  }
})
