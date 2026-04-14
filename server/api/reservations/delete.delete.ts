import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const id = parseInt(query.id as string)

        if (!id) return { success: false, message: 'ID no válido.' }

        const reserva = await db.reserva.findUnique({ where: { id } })
        if (!reserva) return { success: false, message: 'Reserva no encontrada.' }

        // Múltiples lógicas podrían aplicar: si la reserva es de hoy, liberar habitación.
        const today = new Date();
        today.setHours(0,0,0,0);
        const startDay = new Date(reserva.fechaInicio);
        startDay.setHours(0,0,0,0);
        
        await db.reserva.delete({ where: { id } })

        if (today.getTime() === startDay.getTime()) {
            await db.habitacion.update({
                where: { id: reserva.idHabitacion },
                data: { estado: 'Disponible' }
            });
        }

        return { success: true, message: 'Reserva eliminada.' }
    } catch (error) {
        console.error('Error deleting reservation:', error)
        return { success: false, message: 'Error interno o reserva ya ligada a una factura.' }
    }
})
