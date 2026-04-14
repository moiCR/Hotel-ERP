import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, piso, estado, idSede, idCategoria } = body;

        if (!id) {
            return { success: false, message: 'ID de habitación requerido.' }
        }

        const parsedId = parseInt(id, 10);

        const existing = await db.habitacion.findUnique({ where: { id: parsedId } });
        if (!existing) {
            return { success: false, message: 'Habitación no encontrada.' }
        }

        const habitacion = await db.habitacion.update({
            where: { id: parsedId },
            data: {
                piso: piso !== undefined ? parseInt(piso, 10) : existing.piso,
                estado: estado?.trim() ?? existing.estado,
                idSede: idSede !== undefined ? parseInt(idSede, 10) : existing.idSede,
                idCategoria: idCategoria !== undefined ? parseInt(idCategoria, 10) : existing.idCategoria
            }
        });

        return { success: true, habitacion }

    } catch (error) {
        console.error('Error al actualizar habitación:', error);
        return { success: false, message: 'Error interno al actualizar la habitación.' }
    }
})
