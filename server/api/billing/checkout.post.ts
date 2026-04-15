import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { idReserva, montoEfectivoColones = 0, montoEfectivoDolares = 0, montoTarjeta = 0, vuelto = 0, observaciones = '' } = body

        if (!idReserva) return { success: false, message: 'ID Reserva es requerido' }

        // Fetch configs
        const configs = await db.configuracion.findMany()
        let configMap: Record<string, number> = { 'IVA': 13, 'TIPO_CAMBIO': 515 }
        configs.forEach(c => {
            const parsed = parseFloat(c.valor)
            if (!isNaN(parsed)) configMap[c.clave] = parsed
        })

        const reserva = await db.reserva.findUnique({
            where: { id: idReserva },
            include: { Habitacion: { include: { CategoriaHabitacion: true } } }
        })

        if (!reserva) return { success: false, message: 'Reserva no encontrada' }

        const fechaInicio = new Date(reserva.fechaInicio);
        let fechaSalida = new Date(reserva.fechaSalida);
        const diffMs = fechaSalida.getTime() - fechaInicio.getTime();
        let nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (nights <= 0) nights = 1;

        const subtotal = reserva.Habitacion.CategoriaHabitacion.precio * nights;
        const totalIva = subtotal * ((configMap['IVA'] ?? 13) / 100);
        const total = subtotal + totalIva;

        const factura = await db.factura.create({
            data: {
                idReserva,
                subtotal,
                totalIva,
                total,
                tipoCambio: configMap['TIPO_CAMBIO'] ?? 515,
                montoEfectivoColones,
                montoEfectivoDolares,
                montoTarjeta,
                vuelto,
                observaciones
            }
        })

        await db.habitacion.update({
            where: { id: reserva.Habitacion.id },
            data: { estado: 'Limpieza' }
        })

        return {
            success: true,
            data: factura,
            message: 'Facturación exitosa y habitación liberada (Limpieza).'
        }
    } catch (error) {
        console.error('Error during checkout:', error)
        return { success: false, message: 'Server error check console' }
    }
})
