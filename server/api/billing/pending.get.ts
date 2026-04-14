import { db } from '../../utils/db'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
    try {
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

        const pending = await db.reserva.findMany({
            where: {
                Habitacion: {
                    estado: 'Ocupada',
                    ...(userSedeId ? { idSede: userSedeId } : {})
                },
                Factura: {
                    none: {}
                }
            },
            include: {
                Cliente: true,
                Habitacion: {
                    include: {
                        CategoriaHabitacion: true,
                        Sede: true
                    }
                }
            },
            orderBy: {
                fechaInicio: 'asc'
            }
        })

        return {
            success: true,
            data: pending
        }
    } catch (error) {
        console.error('Error fetching pending billing:', error)
        return { success: false, message: 'Internal Server Error' }
    }
})
