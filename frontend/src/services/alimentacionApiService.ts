import { 
    RegistroComida, 
    CrearRegistroComidaRequest, 
    ActualizarRegistroComidaRequest,
    RegistroComidaResponse,
    ListaRegistrosComidaResponse,
    EstadisticasNutricionalResponse,
    FiltrosRegistroComidaRequest,
    AlimentoConsumido,
    TipoComida
} from '@/types/alimentacion.types';

// Simulación de API para el diario de alimentación usando localStorage
class AlimentacionApiService {
    private baseKey = 'alimentacion_';

    // ===== CREAR NUEVO REGISTRO =====
    async crearRegistro(request: CrearRegistroComidaRequest): Promise<RegistroComidaResponse> {
        try {
            // Validaciones básicas
            if (!request.twinId || !request.fecha || !request.tipoComida) {
                throw new Error('Campos obligatorios faltantes');
            }

            if (!request.alimentos || request.alimentos.length === 0) {
                throw new Error('Debe agregar al menos un alimento');
            }

            // Crear nuevo registro
            const nuevoRegistro: RegistroComida = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                fecha: request.fecha,
                tipoComida: request.tipoComida,
                alimentos: request.alimentos,
                horaComida: request.horaComida,
                ubicacion: request.ubicacion,
                estadoAnimo: request.estadoAnimo,
                nivelHambre: request.nivelHambre,
                nivelSaciedad: request.nivelSaciedad,
                notas: request.notas,
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            // Obtener registros existentes
            const registrosExistentes = this.obtenerRegistrosLocalStorage(request.twinId);
            
            // Agregar nuevo registro
            registrosExistentes.push(nuevoRegistro);
            
            // Guardar en localStorage
            this.guardarRegistrosLocalStorage(request.twinId, registrosExistentes);

            return {
                registro: nuevoRegistro,
                mensaje: 'Registro de comida creado exitosamente',
                exito: true
            };

        } catch (error) {
            console.error('Error creando registro de comida:', error);
            throw error;
        }
    }

    // ===== OBTENER REGISTROS =====
    async obtenerRegistros(filtros: FiltrosRegistroComidaRequest): Promise<ListaRegistrosComidaResponse> {
        try {
            let registros = this.obtenerRegistrosLocalStorage(filtros.twinId);

            // Aplicar filtros
            if (filtros.fechaInicio) {
                registros = registros.filter(r => r.fecha >= filtros.fechaInicio!);
            }

            if (filtros.fechaFin) {
                registros = registros.filter(r => r.fecha <= filtros.fechaFin!);
            }

            if (filtros.tiposComida && filtros.tiposComida.length > 0) {
                registros = registros.filter(r => filtros.tiposComida!.includes(r.tipoComida));
            }

            if (filtros.categorias && filtros.categorias.length > 0) {
                registros = registros.filter(r => 
                    r.alimentos.some(a => filtros.categorias!.includes(a.nombreAlimento as any))
                );
            }

            if (filtros.busqueda) {
                const busqueda = filtros.busqueda.toLowerCase();
                registros = registros.filter(r => 
                    r.alimentos.some(a => a.nombreAlimento.toLowerCase().includes(busqueda)) ||
                    (r.notas && r.notas.toLowerCase().includes(busqueda)) ||
                    (r.ubicacion && r.ubicacion.toLowerCase().includes(busqueda))
                );
            }

            // Ordenar
            const ordenPor = filtros.ordenarPor || 'fecha';
            const direccion = filtros.ordenDireccion || 'desc';
            
            registros.sort((a, b) => {
                let valorA, valorB;
                
                switch (ordenPor) {
                    case 'fecha':
                        valorA = new Date(a.fecha + (a.horaComida ? ' ' + a.horaComida : '')).getTime();
                        valorB = new Date(b.fecha + (b.horaComida ? ' ' + b.horaComida : '')).getTime();
                        break;
                    case 'calorias':
                        valorA = a.alimentos.reduce((sum, alimento) => sum + alimento.calorias, 0);
                        valorB = b.alimentos.reduce((sum, alimento) => sum + alimento.calorias, 0);
                        break;
                    case 'fechaCreacion':
                        valorA = new Date(a.fechaCreacion).getTime();
                        valorB = new Date(b.fechaCreacion).getTime();
                        break;
                    default:
                        valorA = a.fecha;
                        valorB = b.fecha;
                }

                if (direccion === 'asc') {
                    return valorA > valorB ? 1 : -1;
                } else {
                    return valorA < valorB ? 1 : -1;
                }
            });

            // Paginación
            const limite = filtros.limite || 50;
            const offset = filtros.offset || 0;
            const total = registros.length;
            const registrosPaginados = registros.slice(offset, offset + limite);

            return {
                registros: registrosPaginados,
                total,
                pagina: Math.floor(offset / limite) + 1,
                limite,
                totalPaginas: Math.ceil(total / limite),
                exito: true
            };

        } catch (error) {
            console.error('Error obteniendo registros:', error);
            throw error;
        }
    }

    // ===== OBTENER REGISTRO POR ID =====
    async obtenerRegistroPorId(twinId: string, registroId: string): Promise<RegistroComidaResponse> {
        try {
            const registros = this.obtenerRegistrosLocalStorage(twinId);
            const registro = registros.find(r => r.id === registroId);

            if (!registro) {
                throw new Error('Registro no encontrado');
            }

            return {
                registro,
                mensaje: 'Registro obtenido exitosamente',
                exito: true
            };

        } catch (error) {
            console.error('Error obteniendo registro:', error);
            throw error;
        }
    }

    // ===== ACTUALIZAR REGISTRO =====
    async actualizarRegistro(request: ActualizarRegistroComidaRequest): Promise<RegistroComidaResponse> {
        try {
            if (!request.id) {
                throw new Error('ID de registro requerido');
            }

            const registros = this.obtenerRegistrosLocalStorage(request.twinId!);
            const indice = registros.findIndex(r => r.id === request.id);

            if (indice === -1) {
                throw new Error('Registro no encontrado');
            }

            // Actualizar registro
            const registroActualizado: RegistroComida = {
                ...registros[indice],
                ...request,
                id: request.id,
                fechaActualizacion: new Date().toISOString()
            };

            registros[indice] = registroActualizado;
            this.guardarRegistrosLocalStorage(request.twinId!, registros);

            return {
                registro: registroActualizado,
                mensaje: 'Registro actualizado exitosamente',
                exito: true
            };

        } catch (error) {
            console.error('Error actualizando registro:', error);
            throw error;
        }
    }

    // ===== ELIMINAR REGISTRO =====
    async eliminarRegistro(twinId: string, registroId: string): Promise<{ exito: boolean; mensaje: string }> {
        try {
            const registros = this.obtenerRegistrosLocalStorage(twinId);
            const registrosFiltrados = registros.filter(r => r.id !== registroId);

            if (registros.length === registrosFiltrados.length) {
                throw new Error('Registro no encontrado');
            }

            this.guardarRegistrosLocalStorage(twinId, registrosFiltrados);

            return {
                exito: true,
                mensaje: 'Registro eliminado exitosamente'
            };

        } catch (error) {
            console.error('Error eliminando registro:', error);
            throw error;
        }
    }

    // ===== OBTENER ESTADÍSTICAS NUTRICIONALES =====
    async obtenerEstadisticas(twinId: string): Promise<EstadisticasNutricionalResponse> {
        try {
            const registros = this.obtenerRegistrosLocalStorage(twinId);
            const hoy = new Date().toISOString().split('T')[0];
            
            // Fechas para cálculos
            const inicioSemana = new Date();
            inicioSemana.setDate(inicioSemana.getDate() - 7);
            const inicioMes = new Date();
            inicioMes.setDate(inicioMes.getDate() - 30);

            // Filtrar por períodos
            const registrosHoy = registros.filter(r => r.fecha === hoy);
            const registrosSemana = registros.filter(r => r.fecha >= inicioSemana.toISOString().split('T')[0]);
            const registrosMes = registros.filter(r => r.fecha >= inicioMes.toISOString().split('T')[0]);

            // Calcular totales
            const calcularTotales = (regs: RegistroComida[]) => {
                return regs.reduce((totales, registro) => {
                    registro.alimentos.forEach(alimento => {
                        totales.calorias += alimento.calorias;
                        totales.proteinas += alimento.proteinas || 0;
                        totales.carbohidratos += alimento.carbohidratos || 0;
                        totales.grasas += alimento.grasas || 0;
                    });
                    return totales;
                }, { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
            };

            const totalesHoy = calcularTotales(registrosHoy);
            const totalesSemana = calcularTotales(registrosSemana);
            const totalesMes = calcularTotales(registrosMes);

            // Alimentos más frecuentes
            const conteoAlimentos: { [key: string]: { count: number; calorias: number } } = {};
            registros.forEach(registro => {
                registro.alimentos.forEach(alimento => {
                    if (!conteoAlimentos[alimento.nombreAlimento]) {
                        conteoAlimentos[alimento.nombreAlimento] = { count: 0, calorias: 0 };
                    }
                    conteoAlimentos[alimento.nombreAlimento].count++;
                    conteoAlimentos[alimento.nombreAlimento].calorias += alimento.calorias;
                });
            });

            const alimentosFrecuentes = Object.entries(conteoAlimentos)
                .map(([nombre, data]) => ({
                    nombreAlimento: nombre,
                    vecesConsumido: data.count,
                    caloriasTotal: data.calorias
                }))
                .sort((a, b) => b.vecesConsumido - a.vecesConsumido)
                .slice(0, 10);

            // Calcular tendencia (simplificada)
            const ultimaSemana = calcularTotales(registros.filter(r => {
                const fecha = new Date(r.fecha);
                const hace7dias = new Date();
                hace7dias.setDate(hace7dias.getDate() - 7);
                const hace14dias = new Date();
                hace14dias.setDate(hace14dias.getDate() - 14);
                return fecha >= hace14dias && fecha < hace7dias;
            }));

            let tendenciaConsumo: 'creciente' | 'estable' | 'decreciente' = 'estable';
            if (totalesSemana.calorias > ultimaSemana.calorias * 1.1) {
                tendenciaConsumo = 'creciente';
            } else if (totalesSemana.calorias < ultimaSemana.calorias * 0.9) {
                tendenciaConsumo = 'decreciente';
            }

            return {
                // Estadísticas diarias
                caloriasHoy: Math.round(totalesHoy.calorias),
                proteinasHoy: Math.round(totalesHoy.proteinas),
                carbohidratosHoy: Math.round(totalesHoy.carbohidratos),
                grasasHoy: Math.round(totalesHoy.grasas),
                fibraHoy: 0, // Simplificado por ahora
                
                // Estadísticas semanales
                caloriasSemana: Math.round(totalesSemana.calorias),
                proteinasSemana: Math.round(totalesSemana.proteinas),
                carbohidratosSemana: Math.round(totalesSemana.carbohidratos),
                grasasSemana: Math.round(totalesSemana.grasas),
                
                // Estadísticas mensuales
                caloriasMes: Math.round(totalesMes.calorias),
                proteinasMes: Math.round(totalesMes.proteinas),
                carbohidratosMes: Math.round(totalesMes.carbohidratos),
                grasasMes: Math.round(totalesMes.grasas),
                
                // Promedios
                caloriasPromedioDia: Math.round(totalesMes.calorias / 30),
                proteinasPromedioDia: Math.round(totalesMes.proteinas / 30),
                
                // Alimentos frecuentes
                alimentosFrecuentes,
                
                // Tendencias
                tendenciaConsumo,
                
                exito: true
            };

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // ===== MÉTODOS PRIVADOS PARA LOCALSTORAGE =====
    private obtenerRegistrosLocalStorage(twinId: string): RegistroComida[] {
        try {
            const key = this.baseKey + twinId;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error leyendo localStorage:', error);
            return [];
        }
    }

    private guardarRegistrosLocalStorage(twinId: string, registros: RegistroComida[]): void {
        try {
            const key = this.baseKey + twinId;
            localStorage.setItem(key, JSON.stringify(registros));
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            throw new Error('Error guardando datos');
        }
    }

    // ===== MÉTODO PARA OBTENER REGISTROS DEL DÍA =====
    async obtenerRegistrosDelDia(twinId: string, fecha?: string): Promise<RegistroComida[]> {
        try {
            const fechaBusqueda = fecha || new Date().toISOString().split('T')[0];
            const registros = this.obtenerRegistrosLocalStorage(twinId);
            return registros.filter(r => r.fecha === fechaBusqueda);
        } catch (error) {
            console.error('Error obteniendo registros del día:', error);
            return [];
        }
    }

    // ===== MÉTODO PARA CALCULAR CALORÍAS DE UN GRUPO DE ALIMENTOS =====
    calcularCaloriasTotal(alimentos: AlimentoConsumido[]): number {
        return alimentos.reduce((total, alimento) => total + alimento.calorias, 0);
    }

    // ===== MÉTODO PARA OBTENER RESUMEN NUTRICIONAL =====
    calcularResumenNutricional(alimentos: AlimentoConsumido[]) {
        return alimentos.reduce((resumen, alimento) => ({
            calorias: resumen.calorias + alimento.calorias,
            proteinas: resumen.proteinas + (alimento.proteinas || 0),
            carbohidratos: resumen.carbohidratos + (alimento.carbohidratos || 0),
            grasas: resumen.grasas + (alimento.grasas || 0)
        }), { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
    }
}

// Exportar instancia singleton
export const alimentacionApiService = new AlimentacionApiService();
export default alimentacionApiService;
