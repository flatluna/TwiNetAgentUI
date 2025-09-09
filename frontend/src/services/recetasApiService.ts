// ===== SERVICIO API PARA RECETAS Y ALIMENTOS =====

import {
    Receta,
    AlimentoBase,
    CrearRecetaRequest,
    ActualizarRecetaRequest,
    CrearAlimentoRequest,
    ActualizarAlimentoRequest,
    FiltrosRecetaRequest,
    FiltrosAlimentoRequest,
    RecetaResponse,
    ListaRecetasResponse,
    AlimentoResponse,
    ListaAlimentosResponse,
    IngredienteReceta,
    InformacionNutricional
} from '@/types/recetas.types';

class RecetasApiService {
    private readonly storageKeyRecetas = 'recetas_';
    
    // Usar proxy de Vite en desarrollo, URL directa en producción
    private readonly apiBaseUrl = import.meta.env.DEV ? '/api' : 'http://localhost:7011/api';
    private readonly foodsEndpoint = `${this.apiBaseUrl}/foods`;

    constructor() {
        // Limpiar datos falsos de localStorage si existen
        this.limpiarDatosFalsos();
    }

    // Limpiar alimentos de ejemplo del localStorage
    private limpiarDatosFalsos() {
        const twinId = '388a31e7-d408-40f0-844c-4d2efedaa836';
        const key = 'alimentos_' + twinId;
        localStorage.removeItem(key);
        console.log('🧹 Datos falsos de localStorage eliminados. Solo se usará la API real.');
        console.log('🔗 Conectando directamente a Azure Functions:', this.apiBaseUrl);
    }

    // ===== MÉTODOS PARA RECETAS =====

    async crearReceta(request: CrearRecetaRequest): Promise<RecetaResponse> {
        try {
            // Calcular información nutricional automáticamente
            const informacionNutricional = this.calcularInformacionNutricional(
                request.ingredientes,
                request.porciones
            );

            const nuevaReceta: Receta = {
                id: Date.now().toString(),
                nombre: request.nombre,
                descripcion: request.descripcion,
                categoria: request.categoria,
                dificultad: request.dificultad,
                tiempoPreparacion: request.tiempoPreparacion,
                tiempoCoccion: request.tiempoCoccion,
                tiempoTotal: request.tiempoPreparacion + (request.tiempoCoccion || 0),
                porciones: request.porciones,
                ingredientes: request.ingredientes.map((ing, index) => ({
                    ...ing,
                    id: `ing_${Date.now()}_${index}`
                })),
                pasos: request.pasos,
                informacionNutricional,
                consejos: request.consejos,
                variaciones: request.variaciones,
                origen: request.origen,
                temporada: request.temporada,
                etiquetas: request.etiquetas,
                imagenUrl: request.imagenUrl,
                videoUrl: request.videoUrl,
                calificacion: 0,
                esFavorita: false,
                vecesPreparada: 0,
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString(),
                creadoPor: request.twinId
            };

            // Guardar en localStorage
            const key = this.storageKeyRecetas + request.twinId;
            const recetasExistentes = this.obtenerRecetasDesdeStorage(key);
            const nuevasRecetas = [...recetasExistentes, nuevaReceta];
            localStorage.setItem(key, JSON.stringify(nuevasRecetas));

            return {
                receta: nuevaReceta,
                mensaje: 'Receta creada exitosamente',
                exito: true
            };
        } catch (error) {
            console.error('Error creando receta:', error);
            throw new Error('Error al crear la receta');
        }
    }

    async obtenerRecetas(filtros: FiltrosRecetaRequest): Promise<ListaRecetasResponse> {
        try {
            const key = this.storageKeyRecetas + filtros.twinId;
            let recetas = this.obtenerRecetasDesdeStorage(key);

            // Aplicar filtros
            if (filtros.categoria) {
                recetas = recetas.filter(r => r.categoria === filtros.categoria);
            }
            if (filtros.dificultad) {
                recetas = recetas.filter(r => r.dificultad === filtros.dificultad);
            }
            if (filtros.tiempoMaximo) {
                recetas = recetas.filter(r => r.tiempoTotal <= filtros.tiempoMaximo!);
            }
            if (filtros.soloFavoritas) {
                recetas = recetas.filter(r => r.esFavorita);
            }
            if (filtros.busqueda) {
                const busquedaLower = filtros.busqueda.toLowerCase();
                recetas = recetas.filter(r => 
                    r.nombre.toLowerCase().includes(busquedaLower) ||
                    r.descripcion.toLowerCase().includes(busquedaLower) ||
                    r.ingredientes.some(i => i.nombre.toLowerCase().includes(busquedaLower)) ||
                    (r.etiquetas && r.etiquetas.some(e => e.toLowerCase().includes(busquedaLower)))
                );
            }
            if (filtros.etiquetas && filtros.etiquetas.length > 0) {
                recetas = recetas.filter(r => 
                    r.etiquetas && filtros.etiquetas!.some(e => r.etiquetas!.includes(e))
                );
            }

            // Ordenar por fecha de actualización (más recientes primero)
            recetas.sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime());

            // Paginación
            const offset = filtros.offset || 0;
            const limite = filtros.limite || 20;
            const total = recetas.length;
            const recetasPaginadas = recetas.slice(offset, offset + limite);

            return {
                recetas: recetasPaginadas,
                total,
                pagina: Math.floor(offset / limite) + 1,
                limite,
                totalPaginas: Math.ceil(total / limite),
                exito: true
            };
        } catch (error) {
            console.error('Error obteniendo recetas:', error);
            throw new Error('Error al obtener las recetas');
        }
    }

    async actualizarReceta(request: ActualizarRecetaRequest): Promise<RecetaResponse> {
        try {
            const key = this.storageKeyRecetas + request.twinId;
            const recetas = this.obtenerRecetasDesdeStorage(key);
            const indice = recetas.findIndex(r => r.id === request.id);

            if (indice === -1) {
                throw new Error('Receta no encontrada');
            }

            const recetaActual = recetas[indice];
            
            // Recalcular información nutricional si se cambiaron ingredientes o porciones
            let informacionNutricional = recetaActual.informacionNutricional;
            if (request.ingredientes || request.porciones) {
                informacionNutricional = this.calcularInformacionNutricional(
                    request.ingredientes || recetaActual.ingredientes,
                    request.porciones || recetaActual.porciones
                );
            }

            const recetaActualizada: Receta = {
                ...recetaActual,
                ...request,
                ingredientes: request.ingredientes || recetaActual.ingredientes,
                informacionNutricional,
                tiempoTotal: (request.tiempoPreparacion || recetaActual.tiempoPreparacion) + 
                           (request.tiempoCoccion || recetaActual.tiempoCoccion || 0),
                fechaActualizacion: new Date().toISOString()
            };

            recetas[indice] = recetaActualizada;
            localStorage.setItem(key, JSON.stringify(recetas));

            return {
                receta: recetaActualizada,
                mensaje: 'Receta actualizada exitosamente',
                exito: true
            };
        } catch (error) {
            console.error('Error actualizando receta:', error);
            throw new Error('Error al actualizar la receta');
        }
    }

    async eliminarReceta(id: string, twinId: string): Promise<{ exito: boolean; mensaje: string }> {
        try {
            const key = this.storageKeyRecetas + twinId;
            const recetas = this.obtenerRecetasDesdeStorage(key);
            const recetasFiltradas = recetas.filter(r => r.id !== id);

            if (recetas.length === recetasFiltradas.length) {
                throw new Error('Receta no encontrada');
            }

            localStorage.setItem(key, JSON.stringify(recetasFiltradas));

            return {
                exito: true,
                mensaje: 'Receta eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando receta:', error);
            throw new Error('Error al eliminar la receta');
        }
    }

    async marcarFavorita(id: string, twinId: string, esFavorita: boolean): Promise<RecetaResponse> {
        try {
            const key = this.storageKeyRecetas + twinId;
            const recetas = this.obtenerRecetasDesdeStorage(key);
            const indice = recetas.findIndex(r => r.id === id);

            if (indice === -1) {
                throw new Error('Receta no encontrada');
            }

            recetas[indice].esFavorita = esFavorita;
            recetas[indice].fechaActualizacion = new Date().toISOString();
            localStorage.setItem(key, JSON.stringify(recetas));

            return {
                receta: recetas[indice],
                mensaje: `Receta ${esFavorita ? 'agregada a' : 'removida de'} favoritas`,
                exito: true
            };
        } catch (error) {
            console.error('Error marcando favorita:', error);
            throw new Error('Error al actualizar favorita');
        }
    }

    // ===== MÉTODOS PARA ALIMENTOS BASE =====

    async crearAlimento(request: CrearAlimentoRequest): Promise<AlimentoResponse> {
        try {
            console.log('🍎 Creando alimento:', request);

            const alimentoData = {
                twinID: request.twinID,
                nombreAlimento: request.nombreAlimento,
                categoria: request.categoria,
                caloriasPor100g: request.caloriasPor100g,
                proteinas: request.proteinas,
                carbohidratos: request.carbohidratos,
                grasas: request.grasas,
                fibra: request.fibra,
                unidadComun: request.unidadComun,
                cantidadComun: request.cantidadComun,
                descripcion: request.descripcion,
                type: "food"
            };

            // URL correcta: POST /api/foods (el twinID va en el body, no en la URL)
            const url = this.foodsEndpoint;
            console.log('🔍 Llamando API crear alimento:', url);
            console.log('📤 Datos enviados:', alimentoData);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alimentoData)
            });

            console.log('📡 Respuesta API status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const nuevoAlimento: AlimentoBase = await response.json();
            console.log('✅ Alimento creado:', nuevoAlimento);

            // Calcular calorías por unidad común si no viene del servidor
            if (!nuevoAlimento.caloriasUnidadComun) {
                nuevoAlimento.caloriasUnidadComun = this.calcularCaloriasUnidadComun(
                    nuevoAlimento.caloriasPor100g,
                    nuevoAlimento.cantidadComun,
                    nuevoAlimento.unidadComun
                );
            }

            return {
                alimento: nuevoAlimento,
                mensaje: 'Alimento creado exitosamente',
                exito: true
            };
        } catch (error) {
            console.error('🚨 Error creando alimento en API:', error);
            
            // Mostrar error específico si es CORS
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('❌ Error CORS: El backend necesita configurar CORS para http://localhost:5173');
                throw new Error('Error de conexión: Verifique que el backend esté corriendo y configure CORS');
            }
            
            throw new Error('Error al crear el alimento en el backend');
        }
    }

    async obtenerAlimentos(filtros: FiltrosAlimentoRequest): Promise<ListaAlimentosResponse> {
        try {
            // URL correcta: GET /api/foods/{twinId} - según FoodFunctions.cs
            const url = `${this.foodsEndpoint}/${filtros.twinID}`;
            console.log('🔍 Llamando API obtener alimentos:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📡 Respuesta API status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📋 Datos recibidos del backend:', data);
            console.log('📋 Estructura completa:', JSON.stringify(data, null, 2));
            
            // Mapear la respuesta real del backend
            // El backend devuelve: { twinId, count, foods: [...] }
            const foods = data.foods || [];
            console.log('🍎 Alimentos encontrados:', foods.length);
            
            // Log detallado de cada alimento
            foods.forEach((food: any, index: number) => {
                console.log(`🍎 Alimento ${index + 1}:`, JSON.stringify(food, null, 2));
            });
            
            // Asegurar que cada alimento tenga caloriasUnidadComun calculadas
            const alimentosConCalorias = foods.map((alimento: AlimentoBase) => {
                if (!alimento.caloriasUnidadComun) {
                    alimento.caloriasUnidadComun = this.calcularCaloriasUnidadComun(
                        alimento.caloriasPor100g,
                        alimento.cantidadComun,
                        alimento.unidadComun
                    );
                }
                return alimento;
            });

            return {
                alimentos: alimentosConCalorias,
                total: data.count || 0,
                pagina: 1, // Sin paginación por ahora
                limite: 50,
                totalPaginas: 1,
                exito: true
            };
        } catch (error) {
            console.error('Error obteniendo alimentos desde API:', error);
            
            // Mostrar error específico si es CORS
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('❌ Error CORS: El backend necesita configurar CORS para http://localhost:5173');
                throw new Error('Error de conexión: Verifique que el backend esté corriendo y configure CORS');
            }
            
            throw new Error('Error al obtener los alimentos desde el backend');
        }
    }

    async actualizarAlimento(request: ActualizarAlimentoRequest): Promise<AlimentoResponse> {
        try {
            console.log('🔄 Actualizando alimento:', request);

            const alimentoData = {
                twinID: request.twinID,
                nombreAlimento: request.nombreAlimento,
                categoria: request.categoria,
                caloriasPor100g: request.caloriasPor100g,
                proteinas: request.proteinas,
                carbohidratos: request.carbohidratos,
                grasas: request.grasas,
                fibra: request.fibra,
                unidadComun: request.unidadComun,
                cantidadComun: request.cantidadComun,
                descripcion: request.descripcion,
                type: "food"
            };

            // URL correcta: PUT /api/foods/{id}?twinID=xxx
            const url = `${this.foodsEndpoint}/${request.id}?twinID=${request.twinID}`;
            console.log('🔍 Llamando API actualizar alimento:', url);
            console.log('📤 Datos enviados:', alimentoData);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alimentoData)
            });

            console.log('📡 Respuesta API status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const alimentoActualizado: AlimentoBase = await response.json();
            console.log('✅ Alimento actualizado:', alimentoActualizado);

            // Calcular calorías por unidad común si no viene del servidor
            if (!alimentoActualizado.caloriasUnidadComun) {
                alimentoActualizado.caloriasUnidadComun = this.calcularCaloriasUnidadComun(
                    alimentoActualizado.caloriasPor100g,
                    alimentoActualizado.cantidadComun,
                    alimentoActualizado.unidadComun
                );
            }

            return {
                alimento: alimentoActualizado,
                mensaje: 'Alimento actualizado exitosamente',
                exito: true
            };
        } catch (error) {
            console.error('🚨 Error actualizando alimento:', error);
            throw new Error('Error al actualizar el alimento');
        }
    }

    async eliminarAlimento(id: string, twinID: string): Promise<{ exito: boolean; mensaje: string }> {
        try {
            // URL correcta: DELETE /api/foods/{id}?twinID=xxx
            const url = `${this.foodsEndpoint}/${id}?twinID=${twinID}`;
            console.log('🗑️ Eliminando alimento:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('📡 Respuesta eliminación status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return {
                exito: true,
                mensaje: 'Alimento eliminado exitosamente'
            };
        } catch (error) {
            console.error('🚨 Error eliminando alimento:', error);
            throw new Error('Error al eliminar el alimento');
        }
    }

    // ===== MÉTODOS AUXILIARES =====

    private obtenerRecetasDesdeStorage(key: string): Receta[] {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error leyendo recetas del localStorage:', error);
            return [];
        }
    }

    private calcularInformacionNutricional(
        ingredientes: Omit<IngredienteReceta, 'id'>[],
        porciones: number
    ): InformacionNutricional {
        const caloriasTotal = ingredientes.reduce((total, ing) => total + ing.calorias, 0);
        
        return {
            caloriasTotal,
            caloriasPorPorcion: Math.round(caloriasTotal / porciones)
        };
    }

    private calcularCaloriasUnidadComun(
        caloriasPor100g: number,
        cantidadComun: number,
        unidadComun?: string
    ): number {
        // Estimaciones más realistas basadas en el tipo de unidad
        let pesoEstimadoPorUnidad = 100; // gramos por unidad (default)
        
        if (unidadComun) {
            switch (unidadComun.toLowerCase()) {
                case 'unidades':
                    pesoEstimadoPorUnidad = 150; // Una fruta/verdura mediana
                    break;
                case 'tazas':
                    pesoEstimadoPorUnidad = 150; // Una taza típica
                    break;
                case 'cucharadas':
                    pesoEstimadoPorUnidad = 15; // Una cucharada
                    break;
                case 'rebanadas':
                    pesoEstimadoPorUnidad = 25; // Una rebanada de pan
                    break;
                case 'gramos':
                    pesoEstimadoPorUnidad = 1; // Exacto en gramos
                    break;
                default:
                    pesoEstimadoPorUnidad = 100; // Default
            }
        }
        
        const pesoTotal = cantidadComun * pesoEstimadoPorUnidad;
        return Math.round((caloriasPor100g * pesoTotal) / 100);
    }
}

export const recetasApiService = new RecetasApiService();
