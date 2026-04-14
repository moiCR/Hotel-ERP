import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id } = body;

        if (!id) {
            return { success: false, message: 'ID de habitación requerido.' }
        }

        const parsedId = parseInt(id, 10);

        const habitacion = await db.habitacion.findUnique({
            where: { id: parsedId }
        });

        if (!habitacion) {
            return { success: false, message: 'Habitación no encontrada.' }
        }

        await db.habitacion.delete({
            where: { id: parsedId }
        });

        return { success: true, message: 'Habitación eliminada correctamente.' }

    } catch (error) {
        console.error('Error al eliminar habitación:', error);
        return { success: false, message: 'Error interno al intentar eliminar la habitación.' }
    }
})
