import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const configs = await db.configuracion.findMany()
        
        let configMap: Record<string, string> = {
            'IVA': '13',
            'TIPO_CAMBIO': '515'
        }

        configs.forEach(c => {
            configMap[c.clave] = c.valor
        })

        return {
            success: true,
            data: configMap
        }
    } catch (error) {
        console.error('Error fetching config:', error)
        return { success: false, message: 'Internal Server Error' }
    }
})
