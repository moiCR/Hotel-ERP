import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id } = body;

        if (!id) {
            return { success: false, message: 'ID de sede requerido.' }
        }

        const parsedId = parseInt(id, 10);

        const sede = await db.sede.findUnique({
            where: { id: parsedId }
        });

        if (!sede) {
            return { success: false, message: 'Sede no encontrada.' }
        }

        await db.sede.delete({
            where: { id: parsedId }
        });

        return { success: true, message: 'Sede eliminada correctamente.' }

    } catch (error) {
        console.error('Error al eliminar sede:', error);
        return { success: false, message: 'Error interno al intentar eliminar la sede.' }
    }
})
