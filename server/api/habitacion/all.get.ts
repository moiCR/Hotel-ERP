import { db } from "../../utils/db";
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const querySedeId = query.sedeId ? parseInt(String(query.sedeId), 10) : undefined;

    let userSedeId: number | undefined = undefined;
    let isAdmin = false;
    const token = getCookie(event, 'session');
    if (token) {
        try {
            const { payload } = await jwtVerify(token, SECRET_KEY);
            isAdmin = payload.rol === 'Administrador' || payload.rol === 'Admin';
            userSedeId = isAdmin ? undefined : (payload.sedeId ? (payload.sedeId as number) : undefined);
        } catch (e) {}
    }

    const unificadoSedeId = userSedeId ?? querySedeId;

    const habitaciones = await db.habitacion.findMany({
      where: unificadoSedeId ? { idSede: unificadoSedeId } : undefined,
      include: {
        CategoriaHabitacion: true,
        Sede: true,
      },
    });

    return { success: true, habitaciones };
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    return { success: false, message: "Error al obtener habitaciones." };
  }
});
