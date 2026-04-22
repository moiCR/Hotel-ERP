# 📖 Manual de Usuario — ERP Hotel

**Sistema de Gestión Hotelera** | Versión 1.0 | Abril 2026

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos del Sistema](#2-requisitos-del-sistema)
3. [Acceso al Sistema](#3-acceso-al-sistema)
4. [Panel Principal (Dashboard)](#4-panel-principal-dashboard)
5. [Módulo de Reservaciones](#5-módulo-de-reservaciones)
6. [Módulo de Facturación](#6-módulo-de-facturación)
7. [Módulo de Habitaciones](#7-módulo-de-habitaciones)
8. [Módulo de Clientes](#8-módulo-de-clientes)
9. [Módulo de Usuarios](#9-módulo-de-usuarios)
10. [Módulo de Roles y Permisos](#10-módulo-de-roles-y-permisos)
11. [Módulo de Sedes](#11-módulo-de-sedes)
12. [Módulo de Reportes](#12-módulo-de-reportes)
13. [Bitácora del Sistema](#13-bitácora-del-sistema)
14. [Configuración](#14-configuración)
15. [Cierre de Sesión](#15-cierre-de-sesión)
16. [Roles y sus Permisos](#16-roles-y-sus-permisos)
17. [Preguntas Frecuentes](#17-preguntas-frecuentes)

---

## 1. Introducción

El **ERP Hotel** es un sistema integral de gestión hotelera que permite administrar de forma centralizada las operaciones de uno o varios establecimientos. Diseñado para optimizar los procesos de reservaciones, facturación, gestión de habitaciones y control de personal, el sistema ofrece una interfaz moderna, segura y accesible desde cualquier navegador web.

### Funcionalidades principales

| Funcionalidad | Descripción |
|---|---|
| Gestión de reservaciones | Crear, consultar y cancelar reservaciones |
| Facturación | Emitir facturas con múltiples métodos de pago |
| Control de habitaciones | Administrar estado y categorías de habitaciones |
| Gestión de clientes | Registro y consulta de clientes |
| Control de usuarios | Administración de cuentas y permisos |
| Reportes | Generación de reportes de ocupación e ingresos |
| Multi-sede | Soporte para múltiples sucursales |
| Bitácora | Registro de accesos al sistema |

---

## 2. Requisitos del Sistema

| Requisito | Especificación |
|---|---|
| **Navegador** | Chrome 110+, Firefox 110+, Edge 110+, Safari 16+ |
| **Conexión** | Internet estable (mínimo 5 Mbps recomendado) |
| **Resolución** | 1280×720 px mínimo |
| **JavaScript** | Habilitado en el navegador |
| **Cookies** | Habilitadas para gestión de sesión |

> El sistema no requiere instalación. Todo funciona directamente desde el navegador.

---

## 3. Acceso al Sistema

### 3.1 Inicio de Sesión

1. Abra su navegador e ingrese la URL del sistema proporcionada por el administrador.
2. Ingrese su **correo electrónico** y **contraseña**.
3. Haga clic en **"Iniciar sesión"**.

> ⚠️ Si ingresa credenciales incorrectas repetidamente, su cuenta puede bloquearse. Contacte al administrador.

### 3.2 Activación de Cuenta

Cuando un administrador crea su cuenta, recibirá un correo electrónico con un enlace de activación:

1. Haga clic en el enlace del correo.
2. Establezca su contraseña en la página de activación.
3. Inicie sesión normalmente.

> El enlace de activación tiene vigencia limitada. Si expiró, solicite al administrador reenviar la invitación.

---

## 4. Panel Principal (Dashboard)

Al iniciar sesión, accederá al **Panel Principal** con un resumen de la operación del hotel:

| Elemento | Descripción |
|---|---|
| **Barra lateral** | Menú de navegación con acceso a todos los módulos permitidos |
| **Tarjetas de resumen** | KPIs: reservaciones activas, habitaciones disponibles, ingresos |
| **Acceso rápido** | Acciones frecuentes según su rol |

---

## 5. Módulo de Reservaciones

### Crear una reservación

1. Haga clic en **"Reservaciones"** → **"Nueva Reservación"**.
2. Seleccione el **cliente**, la **habitación disponible**, la **fecha de entrada** y la **fecha de salida**.
3. Haga clic en **"Guardar"**.

> Solo se muestran habitaciones disponibles para el rango de fechas seleccionado.

### Cancelar una reservación

1. Localice la reservación en la lista.
2. Haga clic en el ícono de eliminar (🗑️) y confirme la acción.

> ⚠️ Esta acción es irreversible.

---

## 6. Módulo de Facturación

### Emitir una Factura

1. Acceda a **"Facturación"** → **"Nueva Factura"**.
2. Seleccione la reservación a facturar.
3. El sistema calculará: subtotal, IVA y total.
4. Ingrese los montos por método de pago:
   - Efectivo en Colones (₡)
   - Efectivo en Dólares ($)
   - Tarjeta
5. Ingrese el **tipo de cambio** si aplica pago en dólares.
6. Haga clic en **"Emitir Factura"**.

El sistema calculará automáticamente el vuelto si corresponde.

---

## 7. Módulo de Habitaciones

### Estados de una Habitación

| Estado | Descripción |
|---|---|
| **Disponible** | Libre para reservar |
| **Ocupada** | Con reservación activa |
| **Mantenimiento** | Fuera de servicio |

### Crear una habitación *(solo Admin/Gerente)*

1. Acceda a **"Hotel"** → **"Habitaciones"** → **"Nueva Habitación"**.
2. Complete: piso, categoría y sede.
3. Haga clic en **"Guardar"**.

---

## 8. Módulo de Clientes

### Registrar un Cliente

1. Acceda a **"Clientes"** → **"Nuevo Cliente"**.
2. Complete: nombre, apellidos y cédula/identificación.
3. Haga clic en **"Guardar"**.

> La cédula debe ser única. No se permite duplicar clientes.

---

## 9. Módulo de Usuarios

> 🔒 Solo **Administrador** y **Gerente** tienen acceso.

### Crear un Usuario

1. Acceda a **"Usuarios"** → **"Nuevo Usuario"**.
2. Complete: nombre, apellidos, correo electrónico, rol y sede.
3. Haga clic en **"Crear"**.
4. El sistema enviará automáticamente un **correo de activación**.

### Editar / Eliminar un Usuario

- **Editar:** Haga clic en el ícono de edición, modifique los datos y guarde.
- **Eliminar:** Haga clic en el ícono de papelera y confirme.

---

## 10. Módulo de Roles y Permisos

> 🔒 Solo **Administradores**.

Desde **"Configuración"** → **"Roles"** puede:
- Ver los roles existentes y sus permisos.
- Crear nuevos roles.
- Editar los permisos asignados a cada rol.

---

## 11. Módulo de Sedes

> 🔒 Solo **Administradores** y **Gerentes**.

Desde **"Hotel"** → **"Sedes"** puede gestionar las sucursales del hotel: ver, crear, editar y eliminar sedes.

---

## 12. Módulo de Reportes

Acceda a **"Reportes"** desde la barra lateral. Tipos disponibles:

| Reporte | Descripción |
|---|---|
| **Ocupación** | Habitaciones ocupadas vs. disponibles |
| **Ingresos** | Resumen de facturación por período |
| **Reservaciones** | Listado detallado de reservaciones |

---

## 13. Bitácora del Sistema

> 🔒 Solo **Administradores** y **Gerentes**.

La bitácora registra automáticamente todos los accesos al sistema. Acceda desde **"Bitácora"** / **"Logs"** para ver el historial de inicios y cierres de sesión.

---

## 14. Configuración

> 🔒 Solo **Administradores**.

Gestione parámetros globales del sistema como: nombre del hotel, configuración fiscal (IVA), correo electrónico y variables de operación.

---

## 15. Cierre de Sesión

1. Haga clic en **"Cerrar sesión"** en la barra lateral.
2. Confirme la acción.
3. Será redirigido a la pantalla de inicio de sesión.

> Por seguridad, siempre cierre sesión en equipos compartidos.

---

## 16. Roles y sus Permisos

| Rol | Módulos accesibles |
|---|---|
| **Administrador** | Todos los módulos |
| **Gerente** | Dashboard, Reservaciones, Facturación, Habitaciones, Clientes, Sedes, Usuarios, Reportes, Bitácora |
| **Recepcionista** | Dashboard, Reservaciones, Habitaciones |
| **Cajero** | Dashboard, Facturación, Reportes, Reservaciones |

---

## 17. Preguntas Frecuentes

**¿Qué hago si olvido mi contraseña?**
Contacte al administrador para restablecer su cuenta.

**¿Funciona en dispositivos móviles?**
Sí, la interfaz es responsiva. Se recomienda escritorio para mayor comodidad.

**¿Puedo eliminar una factura?**
No. Las facturas son definitivas para mantener integridad contable.

**¿El sistema soporta varias sedes?**
Sí. Los usuarios se asignan a una sede y los datos se filtran automáticamente.

**¿Mi sesión expira?**
Sí, por inactividad. Si el sistema le pide iniciar sesión de nuevo, simplemente ingrese sus credenciales.

---

*Manual de Usuario — ERP Hotel v1.0 | Abril 2026*
