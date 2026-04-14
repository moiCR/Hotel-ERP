import { db } from '../../utils/db'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const fechaInicio = query.inicio ? new Date(query.inicio as string) : null;
        const fechaSalida = query.salida ? new Date(query.salida as string) : null;

        if (!fechaInicio || !fechaSalida || fechaInicio >= fechaSalida) {
            return { success: false, message: 'Fechas inválidas.' }
        }

        let userSedeId: number | null = null;
        let isAdmin = false;
        const token = getCookie(event, 'session');
        if (token) {
            try {
                const { payload } = await jwtVerify(token, SECRET_KEY);
                isAdmin = payload.rol === 'Administrador' || payload.rol === 'Admin';
                userSedeId = isAdmin ? null : (payload.sedeId as number | null);
            } catch (e) {}
        }

        // Search for all rooms, but filter out those that have overlapping reservations
        const availableRooms = await db.habitacion.findMany({
            where: {
                ...(userSedeId ? { idSede: userSedeId } : {}),
                Reserva: {
                    none: {
                        AND: [
                            { fechaInicio: { lt: fechaSalida } },
                            { fechaSalida: { gt: fechaInicio } }
                        ]
                    }
                }
            },
            include: {
                CategoriaHabitacion: true,
                Sede: true
            },
            orderBy: { id: 'asc' }
        })

        return { success: true, data: availableRooms }
    } catch (error) {
        console.error('Error fetching available rooms:', error)
        return { success: false, message: 'Internal Server Error' }
    }
})
