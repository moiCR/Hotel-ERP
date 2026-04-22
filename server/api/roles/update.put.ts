import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { id, nombre, permisos } = body;

        if (!id) {
            return { success: false, message: 'El ID del rol es obligatorio.' }
        }

        if (!nombre || !nombre.trim()) {
            return { success: false, message: 'El nombre del rol es obligatorio.' }
        }

        const existing = await db.rol.findUnique({ where: { id: Number(id) } });
        if (!existing) {
            return { success: false, message: 'No se encontró el rol.' }
        }

        const nameCheck = await db.rol.findFirst({
            where: {
                nombre: nombre.trim(),
                id: { not: Number(id) }
            }
        });

        if (nameCheck) {
            return { success: false, message: 'Ya existe otro rol con ese nombre.' }
        }

        const rol = await db.rol.update({
            where: { id: Number(id) },
            data: { 
                nombre: nombre.trim(),
                permisos: Array.isArray(permisos) ? permisos : []
            }
        });

        return { success: true, message: 'Rol actualizado correctamente.', rol }

    } catch (error) {
        console.error('Error al actualizar rol:', error);
        return { success: false, message: 'Error interno al actualizar el rol.' }
    }
})
