import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id } = body;

        if (!id) {
            return { success: false, message: 'ID de rol requerido.' }
        }

        const parsedId = parseInt(id, 10)

        const rol = await db.rol.findUnique({
            where: { id: parsedId }
        });

        if (!rol) {
            return { success: false, message: 'Rol no encontrado.' }
        }

        await db.rol.delete({
            where: { id: parsedId }
        });

        return {
            success: true,
            message: 'Rol eliminado correctamente.'
        }

    } catch (error) {
        console.error('Error al eliminar rol:', error);
        return { success: false, message: 'Error interno al intentar eliminar el rol.' }
    }
})
