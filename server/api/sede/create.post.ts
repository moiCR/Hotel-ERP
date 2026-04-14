import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { ciudad, direccion, central } = body

        if (!ciudad || !ciudad.trim() || !direccion || !direccion.trim()) {
            return { success: false, message: 'Ciudad y dirección son obligatorias.' }
        }

        const sede = await db.sede.create({
            data: {
                ciudad: ciudad.trim(),
                direccion: direccion.trim(),
                central: Boolean(central)
            }
        })

        return { success: true, sede }

    } catch (error) {
        console.error('Error al crear sede:', error)
        return { success: false, message: 'Error interno al crear la sede.' }
    }
})
