import { db } from '../../utils/db'
import * as argon2 from 'argon2'
import { SignJWT } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  try {
    const user = await db.usuario.findUnique({
      where: { email: email },
      include: { Rol: true } 
    })

    if (!user) {
      return { success: false, message: 'Usuario o contraseña incorrectos.' }
    }

    if (!user.isActive) {
      return { success: false, message: 'El usuario no está activo.' }
    }

    if (!user.contrasena) {
      return { success: false, message: 'El usuario no tiene una contraseña activa.' }
    }

    const isPasswordValid = await argon2.verify(user.contrasena, password)

    if (!isPasswordValid) {
      if (user.intentosFallidos >= 3) {
        await db.usuario.update({
          where: { id: user.id },
          data: { isActive: false }
        })
        
        return { success: false, message: 'El usuario ha sido bloqueado por seguridad. Contacte a un administrador.' }
      }

      await db.usuario.update({
        where: { id: user.id },
        data: { intentosFallidos: user.intentosFallidos + 1 }
      })

      return { success: false, message: 'Usuario o contraseña incorrectos.' }
    }

    const expirationTime = '2h'

    const token = await new SignJWT({
      id: user.id,
      nombre: user.nombre,
      rol: user.Rol.nombre,
      permisos: user.Rol.permisos,
      sedeId: user.idSede
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(SECRET_KEY)

    const maxAge = 60 * 60 * 24 * 30

    setCookie(event, 'session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge
    })

    const openBitacoras = await db.bitacora.findMany({
      where: {
        idUsuario: user.id,
        fechaSalida: null
      }
    })

    for (const bitacora of openBitacoras) {
      const expiryDate = new Date(bitacora.fechaIngreso.getTime() + 2 * 60 * 60 * 1000)
      await db.bitacora.update({
        where: { id: bitacora.id },
        data: {
          fechaSalida: new Date() > expiryDate ? expiryDate : new Date()
        }
      })
    }

    await db.bitacora.create({
      data: {
        idUsuario: user.id,
        fechaIngreso: new Date()
      }
    })


    return {
      success: true,
      user: {
        nombre: user.nombre,
        rol: user.Rol
      }
    }

  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Error interno del servidor.' }
  }
})