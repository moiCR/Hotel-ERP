import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, nombre, apellidos, email, rolId, sedeId, isActive } = body;

        if (!id || !nombre || !email || !rolId || !sedeId) {
            return { success: false, message: 'Faltan datos obligatorios.' }
        }

        const parsedId = parseInt(id, 10)

        const existingUser = await db.usuario.findFirst({
            where: { 
                email,
                NOT: { id: parsedId }
            }
        });
        if (existingUser) {
            return { success: false, message: 'El correo ya está en uso por otro usuario.' }
        }

        const updatedUser = await db.usuario.update({
            where: { id: parsedId },
            data: {
                nombre,
                apellidos: apellidos || '',
                email,
                idRol: parseInt(rolId, 10),
                idSede: parseInt(sedeId, 10),
                isActive: Boolean(isActive)
            }
        });

        return { 
            success: true, 
            message: 'Usuario actualizado correctamente.',
            user: updatedUser 
        }

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return { success: false, message: 'Error al actualizar usuario.' }
    }
})
