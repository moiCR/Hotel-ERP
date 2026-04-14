import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id } = body;

        if (!id) {
            return { success: false, message: 'ID de usuario requerido.' }
        }

        const parsedId = parseInt(id, 10)

        // Verificamos si existe
        const user = await db.usuario.findUnique({
            where: { id: parsedId }
        });

        if (!user) {
            return { success: false, message: 'Usuario no encontrado.' }
        }

        await db.usuario.delete({
            where: { id: parsedId }
        });

        return { 
            success: true, 
            message: 'Usuario eliminado correctamente.'
        }

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        return { success: false, message: 'Error interno al intentar eliminar el usuario.' }
    }
})
