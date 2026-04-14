import * as argon2 from 'argon2'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { token, password } = body;

        if (!token || !password) {
            return { success: false, message: 'Token y contraseña son requeridos.' }
        }

        const user = await db.usuario.findUnique({
            where: { activationToken: token }
        });

        if (!user) {
            return { success: false, message: 'Token no válido.' }
        }

        if (user.activationTokenExpiry && user.activationTokenExpiry < new Date()) {
            return { success: false, message: 'El enlace de activación ha expirado.' }
        }

        const hashedPassword = await argon2.hash(password);

        await db.usuario.update({
            where: { id: user.id },
            data: {
                contrasena: hashedPassword,
                activationToken: null,
                activationTokenExpiry: null,
                isActive: true
            }
        });

        return { success: true, message: 'Cuenta activada exitosamente.' }
    } catch (error) {
        console.error('Error al activar cuenta:', error);
        return { success: false, message: 'Error al activar cuenta.' }
    }
})