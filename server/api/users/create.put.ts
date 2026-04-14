import { db } from '../../utils/db'
import { sendActivationEmail } from '../../utils/email'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { nombre, email, rolId, sedeId } = body;

        if (!nombre || !email || !rolId || !sedeId) {
            return { success: false, message: 'Faltan datos obligatorios.' }
        }

        const existingUser = await db.usuario.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, message: 'El correo ya está en uso.' }
        }

        const names = nombre.trim().split(' ');
        const n = names[0];
        const apellidos = names.slice(1).join(' ') || '';

        const token = crypto.randomUUID();
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);

        const newUser = await db.usuario.create({
            data: {
                nombre: n,
                apellidos: apellidos,
                email: email,
                idRol: parseInt(rolId, 10),
                idSede: parseInt(sedeId, 10),
                activationToken: token,
                activationTokenExpiry: expiry,
            }
        });

        // Enviar correo electrónico
        const emailSent = await sendActivationEmail(email, token, nombre);

        return { 
            success: true, 
            message: 'Usuario creado. Correo de activación enviado.',
            user: newUser 
        }

    } catch (error) {
        console.error('Error al crear usuario:', error);
        return { success: false, message: 'Error al crear usuario.' }
    }
})
