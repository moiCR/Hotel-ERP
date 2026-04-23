# ⚙️ Manual Técnico — ERP Hotel

**Sistema de Gestión Hotelera** | Versión 1.0 | Abril 2026

---

## Tabla de Contenidos

1. [Descripción General del Sistema](#1-descripción-general-del-sistema)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Configuración del Entorno](#5-configuración-del-entorno)
6. [Base de Datos](#6-base-de-datos)
7. [API REST — Endpoints](#7-api-rest--endpoints)
8. [Autenticación y Seguridad](#8-autenticación-y-seguridad)
9. [Control de Acceso Basado en Roles (RBAC)](#9-control-de-acceso-basado-en-roles-rbac)
10. [Componentes Frontend Clave](#10-componentes-frontend-clave)
11. [Sistema de Correo Electrónico](#11-sistema-de-correo-electrónico)
12. [Despliegue](#12-despliegue)
13. [Variables de Entorno](#13-variables-de-entorno)
14. [Mantenimiento y Respaldo](#14-mantenimiento-y-respaldo)

---

## 1. Descripción General del Sistema

**ERP Hotel** es una aplicación web full-stack construida con Nuxt 4 (Vue 3) para el frontend/backend de servidor y PostgreSQL como base de datos. El sistema implementa una arquitectura SSR (Server-Side Rendering) con API routes propias, gestionando todas las operaciones hoteleras desde reservaciones hasta facturación multi-moneda.

### Características técnicas destacadas

- Autenticación basada en JWT (JSON Web Tokens) almacenados en cookies HTTP-only.
- Control de acceso granular con permisos por rol (RBAC).
- ORM Prisma para interacción con PostgreSQL.
- Soporte multi-sede con aislamiento de datos por sucursal.
- Sistema de activación de cuentas por correo electrónico.
- Gestión de sesiones con bitácora automática de accesos.
- Encriptación de contraseñas con Argon2.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Framework** | Nuxt | ^4.4.2 |
| **Frontend** | Vue 3 | ^3.5.32 |
| **Routing** | Vue Router | ^5.0.4 |
| **CSS** | Tailwind CSS | ^4.2.2 |
| **Animaciones** | GSAP | ^3.14.2 |
| **Íconos** | Lucide Vue | ^1.8.0 |
| **ORM** | Prisma Client | ^7.7.0 |
| **BD adaptador** | @prisma/adapter-pg | ^7.7.0 |
| **Base de datos** | PostgreSQL | 15+ |
| **Driver BD** | pg (node-postgres) | ^8.20.0 |
| **Hash contraseñas** | Argon2 | ^0.44.0 |
| **JWT** | jose | ^6.2.2 |
| **Email** | Nodemailer | ^8.0.5 |
| **Package manager** | pnpm | latest |
| **TypeScript** | tsx | ^4.21.0 |

---

## 3. Arquitectura del Sistema

El sistema sigue una arquitectura **Nuxt full-stack** donde el servidor y el cliente coexisten en el mismo repositorio:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                │
│  Vue 3 SPA │ Tailwind CSS │ GSAP │ Lucide Icons     │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────┐
│              SERVIDOR NUXT (SSR + API)              │
│  ┌─────────────────┐    ┌────────────────────────┐  │
│  │  Nuxt Middleware │    │  API Routes (/api/*)   │  │
│  │  auth.global.ts  │    │  Autenticación, CRUD   │  │
│  └─────────────────┘    └────────────┬───────────┘  │
└───────────────────────────────────────┼─────────────┘
                                        │ Prisma Client
┌───────────────────────────────────────▼─────────────┐
│                   PostgreSQL Database               │
│  Usuarios │ Roles │ Sedes │ Habitaciones            │
│  Clientes │ Reservas │ Facturas │ Bitácora          │
└─────────────────────────────────────────────────────┘
```

### Flujo de petición

1. El navegador realiza una petición a una ruta del sistema.
2. El middleware global `auth.global.ts` intercepta la petición y valida la sesión JWT via `/api/auth/session`.
3. Si la sesión es válida, verifica permisos de rol para la ruta solicitada.
4. El componente Vue correspondiente se renderiza (SSR o CSR según la ruta).
5. Las operaciones de datos se realizan vía fetch a las API routes del servidor Nuxt.
6. Las API routes utilizan Prisma Client para interactuar con PostgreSQL.

---

## 4. Estructura del Proyecto

```
erp-hotel-nuxt/
├── app/                        # Código del lado cliente (Nuxt app dir)
│   ├── app.vue                 # Componente raíz
│   ├── components/             # Componentes reutilizables
│   │   ├── LogoutModal.vue     # Modal de confirmación de cierre de sesión
│   │   ├── VToast.vue          # Sistema de notificaciones toast
│   │   ├── vButton.vue         # Botón reutilizable
│   │   ├── vModal.vue          # Modal genérico
│   │   ├── vSelect.vue         # Select personalizado
│   │   ├── activate/           # Componentes de activación de cuenta
│   │   ├── billing/            # Componentes de facturación
│   │   ├── hotel/              # Componentes de habitaciones/sedes
│   │   ├── login/              # Componentes de autenticación
│   │   │   └── LoginModal.vue  # Modal de inicio de sesión
│   │   ├── reservations/       # Componentes de reservaciones
│   │   ├── sidebar/            # Navegación lateral
│   │   └── users/              # Gestión de usuarios
│   ├── composables/            # Composables Vue (lógica reutilizable)
│   ├── css/                    # Estilos globales
│   ├── layouts/                # Layouts de página (default, dashboard)
│   ├── middleware/
│   │   └── auth.global.ts      # Guard de autenticación global
│   └── pages/                  # Páginas (file-based routing)
│       ├── index.vue           # Redirige a /login
│       ├── activate.vue        # Activación de cuenta
│       ├── login/              # Página de login
│       └── dashboard/          # Módulos del dashboard
│           ├── index.vue       # Panel principal
│           ├── billing/        # Facturación
│           ├── hotel/          # Habitaciones y sedes
│           ├── logs/           # Bitácora
│           ├── reports/        # Reportes
│           ├── reservations/   # Reservaciones
│           ├── settings/       # Configuración
│           └── users/          # Usuarios y roles
├── server/                     # Código del lado servidor
│   ├── api/                    # API Routes (endpoints REST)
│   │   ├── auth/               # Autenticación (login, logout, session)
│   │   ├── users/              # CRUD usuarios
│   │   ├── roles/              # CRUD roles
│   │   ├── sede/               # CRUD sedes
│   │   ├── habitacion/         # CRUD habitaciones
│   │   ├── categoriaHabitacion/ # CRUD categorías
│   │   ├── reservations/       # CRUD reservaciones
│   │   ├── cliente/            # CRUD clientes
│   │   ├── factura/            # Facturación
│   │   ├── bitacora/           # Logs de acceso
│   │   ├── configuracion/      # Configuración del sistema
│   │   └── reports/            # Endpoints de reportes
│   └── utils/
│       ├── db.ts               # Instancia de Prisma Client
│       └── email.ts            # Servicio de correo (Nodemailer)
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── seed.ts                 # Script de datos iniciales
├── docs/                       # Documentación del proyecto
├── public/                     # Archivos estáticos
├── nuxt.config.ts              # Configuración de Nuxt
├── prisma.config.ts            # Configuración de Prisma
├── package.json
└── tsconfig.json
```

---

## 5. Configuración del Entorno

### Prerrequisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 15+

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/moiCR/Hotel-ERP
cd Hotel-ERP

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales correctas

# 4. Generar el cliente Prisma
pnpm prisma generate

# 5. Ejecutar migraciones de base de datos
pnpm prisma migrate dev

# 6. (Opcional) Sembrar datos iniciales
pnpm tsx prisma/seed.ts

# 7. Iniciar el servidor de desarrollo
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`.

---

## 6. Base de Datos

### Diagrama Entidad-Relación (simplificado)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Usuario   │───┐   │   Reserva    │───────│   Cliente   │
│─────────────│   │   │──────────────│       │─────────────│
│ id (PK)     │   └──►│ idUsuario FK │       │ id (PK)     │
│ nombre      │       │ idHabitacion │       │ nombre      │
│ apellidos   │       │ idCliente FK │       │ apellidos   │
│ email       │       │ fechaReserva │       │ cedula      │
│ contrasena  │       │ fechaInicio  │       └─────────────┘
│ idRol (FK)  │       │ fechaSalida  │
│ idSede (FK) │       └──────┬───────┘
│ isActive    │              │
│ intentosFall│              │
└──────┬──────┘         ┌────▼──────┐      ┌──────────────────┐
       │                │  Factura  │      │   Habitacion     │
┌──────▼──────┐         │───────────│      │──────────────────│
│    Rol      │         │ id (PK)   │      │ id (PK)          │
│─────────────│         │ idReserva │      │ piso             │
│ id (PK)     │         │ subtotal  │      │ estado           │
│ nombre      │         │ totalIva  │      │ idSede (FK)      │
│ permisos[]  │         │ total     │      │ idCategoria (FK) │
└─────────────┘         │ tipoCambio│      └──────────────────┘
                        │ montoEfCRC│
┌─────────────┐         │ montoEfUSD│      ┌──────────────────────┐
│    Sede     │         │ montoTarj │      │  CategoriaHabitacion │
│─────────────│         │ vuelto    │      │──────────────────────│
│ id (PK)     │         │ fecha     │      │ id (PK)              │
│ ciudad      │         └───────────┘      │ nombreCategoria      │
│ direccion   │                            │ precio               │
│ central     │         ┌─────────────┐    └──────────────────────┘
└─────────────┘         │  Bitacora   │
                        │─────────────│    ┌──────────────────┐
                        │ id (PK)     │    │  Configuracion   │
                        │ idUsuario FK│    │──────────────────│
                        │ fechaIngreso│    │ id (PK)          │
                        │ fechaSalida │    │ clave (unique)   │
                        └─────────────┘    │ valor            │
                                           │ descripcion      │
                                           └──────────────────┘
```

### Modelos Prisma

#### Usuario
```prisma
model Usuario {
  id                    Int        @id @default(autoincrement())
  nombre                String
  email                 String     @unique
  apellidos             String
  contrasena            String?
  intentosFallidos      Int        @default(0)
  idRol                 Int
  idSede                Int?
  isActive              Boolean    @default(false)
  activationToken       String?    @unique
  activationTokenExpiry DateTime?
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @default(now())
  Bitacora              Bitacora[]
  Reserva               Reserva[]
  Rol                   Rol        @relation(fields: [idRol], references: [id])
  Sede                  Sede?      @relation(fields: [idSede], references: [id])
}
```

#### Rol
```prisma
model Rol {
  id       Int       @id @default(autoincrement())
  nombre   String    @unique
  permisos String[]  @default([])
  Usuario  Usuario[]
}
```

#### Reserva
```prisma
model Reserva {
  id           Int        @id @default(autoincrement())
  idUsuario    Int?
  idHabitacion Int
  idCliente    Int
  fechaReserva DateTime   @default(now())
  fechaInicio  DateTime
  fechaSalida  DateTime
  Factura      Factura[]
  Cliente      Cliente    @relation(fields: [idCliente], references: [id])
  Habitacion   Habitacion @relation(fields: [idHabitacion], references: [id])
  Usuario      Usuario?   @relation(fields: [idUsuario], references: [id])
}
```

---

## 7. API REST — Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión (retorna JWT en cookie) |
| `POST` | `/api/auth/logout` | Cerrar sesión (invalida cookie) |
| `GET` | `/api/auth/session` | Verificar sesión activa |

### Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/users/all` | Obtener todos los usuarios |
| `PUT` | `/api/users/create` | Crear usuario (envía email de activación) |
| `PUT` | `/api/users/update` | Actualizar datos de usuario |
| `DELETE` | `/api/users/delete` | Eliminar usuario |
| `PUT` | `/api/users/activate` | Activar cuenta (con token) |

### Roles

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/roles/all` | Obtener todos los roles |
| `POST` | `/api/roles/create` | Crear rol |
| `PUT` | `/api/roles/update` | Actualizar permisos de rol |
| `DELETE` | `/api/roles/delete` | Eliminar rol |

### Sedes

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/sede/all` | Obtener todas las sedes |
| `GET` | `/api/sede/:id` | Obtener sede por ID |
| `POST` | `/api/sede/create` | Crear sede |
| `PUT` | `/api/sede/update` | Actualizar sede |
| `DELETE` | `/api/sede/delete` | Eliminar sede |

### Habitaciones

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/habitacion/all` | Obtener todas las habitaciones |
| `POST` | `/api/habitacion/create` | Crear habitación |
| `PUT` | `/api/habitacion/update` | Actualizar habitación |
| `DELETE` | `/api/habitacion/delete` | Eliminar habitación |

### Reservaciones

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/reservations/all` | Obtener todas las reservaciones |
| `GET` | `/api/reservations/rooms-available` | Habitaciones disponibles por fechas |
| `POST` | `/api/reservations/create` | Crear reservación |
| `DELETE` | `/api/reservations/delete` | Eliminar reservación |

### Clientes

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/cliente/all` | Obtener clientes |
| `POST` | `/api/cliente/create` | Crear cliente |
| `PUT` | `/api/cliente/update` | Actualizar cliente |
| `DELETE` | `/api/cliente/delete` | Eliminar cliente |

### Facturación

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/billing/all` | Obtener facturas |
| `POST` | `/api/billing/create` | Emitir factura |

### Bitácora

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/bitacora/all` | Obtener logs de acceso |

### Configuración

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/configuracion/all` | Obtener parámetros |
| `PUT` | `/api/configuracion/update` | Actualizar parámetro |

---

## 8. Autenticación y Seguridad

### Flujo de Autenticación

```
Cliente                          Servidor
   │                                │
   │─── POST /api/auth/login ──────►│
   │    { email, password }         │
   │                                │─── Buscar usuario en DB
   │                                │─── Verificar Argon2 hash
   │                                │─── Verificar intentosFallidos
   │                                │─── Crear JWT (jose)
   │◄── Set-Cookie: auth_token ─────│    payload: { id, rol, sede, permisos }
   │    (HttpOnly, Secure, SameSite)│─── Registrar en Bitácora
   │                                │
```

### Gestión de Sesiones

- **Token:** JWT firmado con clave secreta via librería `jose`.
- **Almacenamiento:** Cookie `HttpOnly` (inaccesible desde JavaScript del cliente).
- **Validación:** El endpoint `GET /api/auth/session` decodifica y verifica el token en cada petición de middleware.
- **Payload del JWT:**
  ```json
  {
    "id": 1,
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@hotel.com",
    "rol": "Administrador",
    "sede": 1,
    "permisos": ["manage_users", "view_reports", "..."]
  }
  ```

### Seguridad de Contraseñas

- Las contraseñas se hashean con **Argon2** (algoritmo resistente a ataques de fuerza bruta y GPU).
- Se rastrean los `intentosFallidos` por usuario.
- Las cuentas nuevas se crean como **inactivas** (`isActive: false`) y requieren activación por correo.

### Activación de Cuentas

1. El administrador crea un usuario → se genera un `activationToken` único + `activationTokenExpiry`.
2. Se envía un correo con el enlace que incluye el token.
3. El usuario accede al enlace y establece su contraseña.
4. El token es invalidado y la cuenta queda activa (`isActive: true`).

---

## 9. Control de Acceso Basado en Roles (RBAC)

### Middleware Global (`auth.global.ts`)

El middleware intercepta **todas las navegaciones** y aplica la siguiente lógica:

```typescript
// Rutas públicas (no requieren autenticación)
const publicRoutes = ['/login', '/activate']

// Si no está autenticado → redirige a /login
// Si está autenticado y va a /login → redirige a /dashboard

// Control por rol:
// - /dashboard/users, /dashboard/logs, /dashboard/settings
//   → Solo: administrador, admin, gerente
// - Cajero → Solo: /dashboard, /dashboard/billing, /dashboard/reports, /dashboard/reservations
// - Recepcionista → Solo: /dashboard, /dashboard/reservations, /dashboard/hotel
```

### Estructura de Permisos

Los permisos se almacenan como array de strings en el modelo `Rol.permisos[]`. Ejemplos:

```
manage_users       → Gestión de usuarios
manage_roles       → Gestión de roles
view_reports       → Ver reportes
manage_reservations → Gestión de reservaciones
manage_billing     → Gestión de facturación
manage_rooms       → Gestión de habitaciones
view_logs          → Ver bitácora
manage_settings    → Configuración del sistema
```

---

## 10. Componentes Frontend Clave

### `vModal.vue`
Modal genérico reutilizable con soporte para confirmaciones, formularios y alertas.

### `vSelect.vue`
Componente select personalizado con búsqueda y estilos del sistema de diseño.

### `vButton.vue`
Botón reutilizable con variantes (primary, danger, secondary) y estados de carga.

### `VToast.vue`
Sistema de notificaciones toast para feedback de acciones al usuario.

### `LoginModal.vue`
Componente del formulario de inicio de sesión con manejo de errores y estados.

### `sidebar/`
Componente de navegación lateral que filtra elementos según permisos del usuario autenticado.

---

## 11. Sistema de Correo Electrónico

El servicio de correo (`server/utils/email.ts`) usa **Nodemailer** para:
- Enviar correos de activación de cuenta con enlace tokenizado.
- Configuración via variables de entorno (`SMTP_HOST`, `SMTP_PORT`, etc.).

```typescript
// Ejemplo de uso interno
await sendActivationEmail({
  to: user.email,
  activationUrl: `${BASE_URL}/activate?token=${token}`
})
```

---

## 12. Despliegue

### Construcción para producción

```bash
pnpm build
pnpm preview    # Probar el build localmente
```

### Variables de entorno de producción

Asegúrese de configurar todas las variables del archivo `.env` antes del despliegue (ver sección siguiente).

### Base de datos en producción

```bash
# Aplicar migraciones en producción
pnpm prisma migrate deploy
```

### Consideraciones de despliegue

- El servidor Nuxt requiere Node.js 20+ en el host.
- PostgreSQL debe ser accesible desde el servidor de la aplicación.
- Configure el proxy inverso (Nginx/Apache) apuntando al puerto de Nuxt (default: 3000).
- Habilite HTTPS en producción para proteger las cookies de sesión.

---

## 13. Variables de Entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Clave secreta para firmar JWT | `superSecretKey123` |
| `SMTP_HOST` | Servidor SMTP para correos | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | `hotel@gmail.com` |
| `SMTP_PASS` | Contraseña SMTP / App Password | `apppassword123` |
| `BASE_URL` | URL base del sistema | `https://erp.mihotel.com` |

---

## 14. Mantenimiento y Respaldo

### Respaldo de Base de Datos

```bash
# Crear respaldo
pg_dump -U postgres erp_hotel > backup_$(date +%Y%m%d).sql

# Restaurar respaldo
psql -U postgres erp_hotel < backup_20260421.sql
```

### Actualización del Sistema

```bash
git pull origin main
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
```

### Monitoreo

- Revisar la **Bitácora** del sistema periódicamente para detectar accesos inusuales.
- Verificar los logs del servidor Node.js para errores de aplicación.
- Monitorear el espacio en disco de PostgreSQL.

---

*Manual Técnico — ERP Hotel v1.0 | Abril 2026*
