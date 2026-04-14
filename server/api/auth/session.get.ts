import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'session')

  if (!token) {
    return { authenticated: false, payload: null }
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    
    return { 
      authenticated: true, 
      payload: payload 
    }
  } catch (error) {
    return { authenticated: false, payload: null }
  }
})