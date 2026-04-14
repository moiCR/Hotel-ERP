import { db } from '../../utils/db'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { idCliente, idHabitacion, fechaInicio, fechaSalida } = body

        if (!idCliente || !idHabitacion || !fechaInicio || !fechaSalida) {
            return { success: false, message: 'Faltan campos requeridos.' }
        }

        const fInit = new Date(fechaInicio)
        const fEnd = new Date(fechaSalida)

        // Prevent overlapping reservations
        const overlap = await db.reserva.findFirst({
            where: {
                idHabitacion,
                AND: [
                    { fechaInicio: { lt: fEnd } },
                    { fechaSalida: { gt: fInit } }
                ]
            }
        })

        if (overlap) {
            return { success: false, message: 'La habitación ya está reservada en esas fechas.' }
        }

        // Get token for idUsuario
        let idUsuario = null;
        const token = getCookie(event, 'session')
        if (token) {
            try {
                const { payload } = await jwtVerify(token, SECRET_KEY)
                idUsuario = payload.id as number
            } catch (e) {
                // Ignore silent failure
            }
        }

        await db.habitacion.update({
            where: { id: idHabitacion },
            data: { estado: 'Ocupada' }
        })

        const reserva = await db.reserva.create({
            data: {
                idCliente,
                idHabitacion,
                idUsuario,
                fechaInicio: fInit,
                fechaSalida: fEnd
            }
        })

        
        const todayDate = new Date();
        const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
        const isToday = fechaInicio.startsWith(todayStr);

        if (isToday) {
            await db.habitacion.update({
                where: { id: idHabitacion },
                data: { estado: 'Ocupada' }
            });
        }

        return { success: true, data: reserva, message: 'Reserva creada exitosamente.' }
    } catch (error) {
        console.error('Error creating reservation:', error)
        return { success: false, message: 'Error interno del servidor.' }
    }
})
