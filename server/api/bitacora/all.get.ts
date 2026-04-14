import { db } from "../../utils/db";

export default defineEventHandler(async (event) => {
    
    try {
        const logs = await db.bitacora.findMany({
            include: {
                Usuario: {
                    include: {
                        Rol: true,
                        Sede: true
                    }
                }
            },
            orderBy: {
                fechaIngreso: 'desc'
            }
        })
        return logs
    } catch (error) {
        console.error('Error al obtener bitácora:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor.'
        })
    }
})