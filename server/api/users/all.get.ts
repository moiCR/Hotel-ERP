import { db } from "../../utils/db";

export default defineEventHandler(async (event) => {
    try {
        
        const users = await db.usuario.findMany({
            include: {
                Rol: true,
                Sede: true
            }
        })
        return users
    } catch (error) {
        console.error('Error al obtener usuarios:', error)
        return { success: false, message: 'Error interno del servidor.' }
    }
})