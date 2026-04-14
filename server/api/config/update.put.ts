import { db } from '../../utils/db'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'session')
    if (!token) return { success: false, message: 'No session' }

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY)
        const rol = (payload.rol as string || '').toLowerCase()
        if (!rol.includes('gerente') && !rol.includes('admin') && !rol.includes('root')) {
            return { success: false, message: 'Permisos insuficientes' }
        }

        const body = await readBody(event)
        const { iva, tipoCambio } = body

        if (iva !== undefined) {
            await db.configuracion.upsert({
                where: { clave: 'IVA' },
                update: { valor: String(iva) },
                create: { clave: 'IVA', valor: String(iva), descripcion: 'Porcentaje de IVA' }
            })
        }

        if (tipoCambio !== undefined) {
            await db.configuracion.upsert({
                where: { clave: 'TIPO_CAMBIO' },
                update: { valor: String(tipoCambio) },
                create: { clave: 'TIPO_CAMBIO', valor: String(tipoCambio), descripcion: 'Tipo de cambio Dólar' }
            })
        }

        return { success: true, message: 'Configuración actualizada' }
    } catch (error) {
        console.error('Error updating config:', error)
        return { success: false, message: 'Error interno o sesión inválida' }
    }
})
