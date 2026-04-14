import { db } from "../server/utils/db";
import * as argon2 from "argon2";

async function main() {
    const salt = await argon2.hash(process.env.ADMIN_PASSWORD!);

    if (!process.env.ADMIN_PASSWORD) {
        throw new Error("ADMIN_PASSWORD environment variable is not set");
    }

    const hashedAdminPassword = await argon2.hash(process.env.ADMIN_PASSWORD!.toString())
    
    const adminRole = await db.rol.upsert({
        where: { nombre: "Administrador" },
        update: {},
        create: { nombre: "Administrador" }
    })

    const sedeCentral = await db.sede.upsert({
        where: { id: 1 },
        update: {},
        create: { ciudad: "San José", direccion: "Residencial, Diag. 23A, San José, Robledal, 10107", central: true }
    })

    await db.usuario.upsert({
        where: { id: 1 },
        update: {},
        create: {
            nombre: "Admin",
            apellidos: "Sistema",
            contrasena: hashedAdminPassword,
            idRol: adminRole.id,
            idSede: sedeCentral.id,
            email: "admin@admin.com",
            isActive: true,
            activationToken: null,
            activationTokenExpiry: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    console.log("The process has been successfully completed.");
}

main()
    .then(async () => { await db.$disconnect(); })
    .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });