import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { nombre, apellidos, cedula } = body

        if (!nombre || !apellidos || !cedula) {
            return { success: false, message: 'Todos los campos (nombre, apellidos, cedula) son obligatorios.' }
        }

        const existing = await db.cliente.findUnique({ where: { cedula } })
        if (existing) {
            return { success: false, message: 'Ya existe un cliente registrado con esta cédula.' }
        }

        const client = await db.cliente.create({
            data: { nombre, apellidos, cedula }
        })

        return { success: true, data: client, message: 'Cliente registrado con éxito.' }
    } catch (error) {
        console.error('Error creating client:', error)
        return { success: false, message: 'Error interno del servidor.' }
    }
})
