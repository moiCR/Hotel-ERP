import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { nombre, permisos } = body;

        if (!nombre || !nombre.trim()) {
            return { success: false, message: 'El nombre del rol es obligatorio.' }
        }

        const existing = await db.rol.findUnique({ where: { nombre: nombre.trim() } });
        if (existing) {
            return { success: false, message: 'Ya existe un rol con ese nombre.' }
        }

        const rol = await db.rol.create({
            data: { 
                nombre: nombre.trim(),
                permisos: Array.isArray(permisos) ? permisos : []
            }
        });

        return { success: true, message: 'Rol creado correctamente.', rol }

    } catch (error) {
        console.error('Error al crear rol:', error);
        return { success: false, message: 'Error interno al crear el rol.' }
    }
})
