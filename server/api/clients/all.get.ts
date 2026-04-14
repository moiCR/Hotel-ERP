import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const clients = await db.cliente.findMany({
            include: {
                _count: {
                    select: { Reserva: true }
                }
            },
            orderBy: {
                id: 'desc'
            }
        })
        return { success: true, data: clients }
    } catch (error) {
        console.error('Error fetching clients:', error)
        return { success: false, message: 'Internal Server Error' }
    }
})
