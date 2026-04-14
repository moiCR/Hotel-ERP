import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const targetDate = query.date ? new Date(query.date as string) : new Date();
        
        // Start and end of the target day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const facturas = await db.factura.findMany({
            where: {
                fecha: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                Reserva: {
                    include: {
                        Habitacion: {
                            include: {
                                CategoriaHabitacion: true
                            }
                        }
                    }
                }
            }
        });

        // Totals
        let pagadoEfectivoColones = 0;
        let pagadoEfectivoDolares = 0;
        let pagadoTarjeta = 0;
        let facturadoNetoColones = 0; // considering the real value paid inside
        
        // Group by category
        const ventasPorCategoria: Record<string, { count: number, subtotal: number }> = {};

        facturas.forEach(fac => {
            pagadoEfectivoColones += fac.montoEfectivoColones;
            pagadoEfectivoDolares += fac.montoEfectivoDolares;
            pagadoTarjeta += fac.montoTarjeta;
            facturadoNetoColones += fac.total;

            const cat = fac.Reserva.Habitacion.CategoriaHabitacion.nombreCategoria;
            if (!ventasPorCategoria[cat]) {
                ventasPorCategoria[cat] = { count: 0, subtotal: 0 };
            }
            ventasPorCategoria[cat].count += 1;
            ventasPorCategoria[cat].subtotal += fac.subtotal;
        });

        return {
            success: true,
            data: {
                summary: {
                    totalColonesEfectivo: pagadoEfectivoColones,
                    totalDolaresEfectivo: pagadoEfectivoDolares,
                    totalTarjeta: pagadoTarjeta,
                    totalGeneral: facturadoNetoColones,
                    cantidadFacturas: facturas.length
                },
                byCategory: Object.entries(ventasPorCategoria).map(([nombre, stats]) => ({
                    categoria: nombre,
                    cantidadDevuelta: stats.count,
                    ingresoSubtotal: stats.subtotal
                })),
                rawFacturas: facturas
            }
        }
    } catch (error) {
        console.error('Error fetching reports:', error)
        return { success: false, message: 'Internal Server Error' }
    }
})
