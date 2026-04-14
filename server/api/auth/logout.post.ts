import { jwtVerify } from 'jose'
import { db } from '../../utils/db'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'session')

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY)
      if (payload && payload.id) {
        const activeBitacora = await db.bitacora.findFirst({
          where: { 
            idUsuario: payload.id as number,
            fechaSalida: null
          },
          orderBy: { fechaIngreso: 'desc' }
        })

        if (activeBitacora) {
          await db.bitacora.update({
            where: { id: activeBitacora.id },
            data: { fechaSalida: new Date() }
          })
        }
      }
    } catch (error) {
      console.error('Error procesando log in logout auth:', error)
    }
  }

  deleteCookie(event, 'session', {
    path: '/'
  })

  return { success: true, message: 'Successfully logged out.' }
})