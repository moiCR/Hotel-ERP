import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, ciudad, direccion, central } = body;

        if (!id) {
            return { success: false, message: 'ID de sede requerido.' }
        }

        const parsedId = parseInt(id, 10);

        const existing = await db.sede.findUnique({ where: { id: parsedId } });
        if (!existing) {
            return { success: false, message: 'Sede no encontrada.' }
        }

        const sede = await db.sede.update({
            where: { id: parsedId },
            data: {
                ciudad: ciudad?.trim() ?? existing.ciudad,
                direccion: direccion?.trim() ?? existing.direccion,
                central: central !== undefined ? Boolean(central) : existing.central
            }
        });

        return { success: true, sede }

    } catch (error) {
        console.error('Error al actualizar sede:', error);
        return { success: false, message: 'Error interno al actualizar la sede.' }
    }
})
