import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Plus,
    Search,
    Edit,
    Trash2,
    Save,
    X,
    ChefHat,
    Clock,
    Users,
    Star,
    Heart,
    Apple,
    BookOpen,
    Utensils,
    Filter,
    Eye
} from "lucide-react";

import {
    Receta,
    AlimentoBase,
    CrearRecetaRequest,
    CrearAlimentoRequest,
    ActualizarAlimentoRequest,
    IngredienteReceta,
    PasoPreparacion,
    CategoriaReceta,
    CategoriaAlimento,
    DificultadReceta,
    UnidadIngrediente,
    categoriasReceta,
    categoriasAlimento,
    unidadesIngrediente
} from "@/types/recetas.types";

// Importar servicio API
import { recetasApiService } from "@/services/recetasApiService";

// Tipo para el formulario de alimentos (usa nombres antiguos para compatibilidad con UI)
interface FormularioAlimento {
    nombre: string;
    categoria: string;
    caloriasPor100g: number;
    unidadComun: string;
    cantidadComun: number;
    descripcion: string;
    proteinas?: number;
    carbohidratos?: number;
    grasas?: number;
    fibra?: number;
}

const RecetasSaludablesPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    // Estados principales
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [alimentos, setAlimentos] = useState<AlimentoBase[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Estados para modales
    const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
    const [modalAlimentoAbierto, setModalAlimentoAbierto] = useState(false);
    const [modoEdicionReceta, setModoEdicionReceta] = useState(false);
    const [modoEdicionAlimento, setModoEdicionAlimento] = useState(false);
    const [recetaEditando, setRecetaEditando] = useState<string | null>(null);
    const [alimentoEditando, setAlimentoEditando] = useState<string | null>(null);
    
    // Estados para filtros
    const [busquedaRecetas, setBusquedaRecetas] = useState('');
    const [filtroRecetaCategoria, setFiltroRecetaCategoria] = useState('');
    const [busquedaAlimentos, setBusquedaAlimentos] = useState('');
    const [filtroAlimentoCategoria, setFiltroAlimentoCategoria] = useState('');
    
    // Estados para nuevas entidades
    const [nuevaReceta, setNuevaReceta] = useState<Partial<Receta>>({
        nombre: '',
        descripcion: '',
        categoria: 'Almuerzo',
        dificultad: 'Fácil',
        tiempoPreparacion: 30,
        tiempoCoccion: 0,
        porciones: 4,
        ingredientes: [],
        pasos: [],
        consejos: [],
        etiquetas: []
    });

    const [nuevoAlimento, setNuevoAlimento] = useState<FormularioAlimento>({
        nombre: '',
        categoria: 'Frutas',
        caloriasPor100g: 0,
        unidadComun: 'unidades',
        cantidadComun: 1,
        descripcion: '',
        proteinas: 0,
        carbohidratos: 0,
        grasas: 0,
        fibra: 0
    });

    // Estados para agregar ingredientes y pasos
    const [nuevoIngrediente, setNuevoIngrediente] = useState<Partial<IngredienteReceta>>({
        nombre: '',
        cantidad: 1,
        unidad: 'unidades',
        calorias: 0
    });

    const [nuevoPaso, setNuevoPaso] = useState<Partial<PasoPreparacion>>({
        numero: 1,
        descripcion: '',
        tiempoEstimado: 5
    });

    const getCurrentTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
    };

    // Cargar datos al inicializar
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const twinId = getCurrentTwinId();
            console.log('🆔 TwinID obtenido:', twinId);
            
            if (!twinId) {
                console.error('❌ No se pudo obtener twinID');
                return;
            }

            console.log('🚀 Iniciando carga de datos...');

            const [recetasResponse, alimentosResponse] = await Promise.all([
                recetasApiService.obtenerRecetas({ twinId }),
                recetasApiService.obtenerAlimentos({ twinID: twinId }) // Cambiado a twinID
            ]);

            console.log('📋 Respuesta recetas:', recetasResponse);
            console.log('🍎 Respuesta alimentos:', alimentosResponse);

            setRecetas(recetasResponse.recetas);
            setAlimentos(alimentosResponse.alimentos);
            
            console.log('✅ Datos cargados exitosamente - Recetas:', recetasResponse.recetas?.length, 'Alimentos:', alimentosResponse.alimentos?.length);
        } catch (error) {
            console.error('🚨 Error cargando datos:', error);
            
            // Mostrar mensaje específico para problemas de API
            if (error instanceof Error) {
                if (error.message.includes('CORS')) {
                    alert('❌ Error de conexión con el backend:\n\nEl servidor necesita configurar CORS para permitir conexiones desde http://localhost:5173\n\nContacte al administrador del sistema.');
                } else {
                    alert(`❌ Error cargando datos: ${error.message}`);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // ===== MÉTODOS PARA RECETAS =====

    const crearReceta = async () => {
        if (!nuevaReceta.nombre || !nuevaReceta.descripcion || !nuevaReceta.ingredientes?.length || !nuevaReceta.pasos?.length) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId) return;

        try {
            const request: CrearRecetaRequest = {
                twinId,
                nombre: nuevaReceta.nombre,
                descripcion: nuevaReceta.descripcion,
                categoria: nuevaReceta.categoria as CategoriaReceta,
                dificultad: nuevaReceta.dificultad as DificultadReceta,
                tiempoPreparacion: nuevaReceta.tiempoPreparacion || 30,
                tiempoCoccion: nuevaReceta.tiempoCoccion,
                porciones: nuevaReceta.porciones || 4,
                ingredientes: nuevaReceta.ingredientes.map(ing => ({
                    nombre: ing.nombre,
                    cantidad: ing.cantidad,
                    unidad: ing.unidad,
                    calorias: ing.calorias,
                    esOpcional: ing.esOpcional,
                    notas: ing.notas
                })),
                pasos: nuevaReceta.pasos,
                consejos: nuevaReceta.consejos,
                etiquetas: nuevaReceta.etiquetas,
                origen: nuevaReceta.origen,
                temporada: nuevaReceta.temporada
            };

            const response = await recetasApiService.crearReceta(request);
            setRecetas([response.receta, ...recetas]);
            resetearFormularioReceta();
            setModalRecetaAbierto(false);
        } catch (error) {
            console.error('Error creando receta:', error);
            alert('Error al crear la receta');
        }
    };

    const editarReceta = (id: string) => {
        const receta = recetas.find(r => r.id === id);
        if (receta) {
            setNuevaReceta(receta);
            setRecetaEditando(id);
            setModoEdicionReceta(true);
            setModalRecetaAbierto(true);
        }
    };

    const eliminarReceta = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
            try {
                const twinId = getCurrentTwinId();
                if (!twinId) return;

                await recetasApiService.eliminarReceta(id, twinId);
                setRecetas(recetas.filter(r => r.id !== id));
            } catch (error) {
                console.error('Error eliminando receta:', error);
                alert('Error al eliminar la receta');
            }
        }
    };

    const toggleFavorita = async (id: string, esFavorita: boolean) => {
        try {
            const twinId = getCurrentTwinId();
            if (!twinId) return;

            const response = await recetasApiService.marcarFavorita(id, twinId, esFavorita);
            setRecetas(recetas.map(r => r.id === id ? response.receta : r));
        } catch (error) {
            console.error('Error actualizando favorita:', error);
        }
    };

    // ===== MÉTODOS PARA ALIMENTOS =====

    const crearAlimento = async () => {
        if (!nuevoAlimento.nombre || !nuevoAlimento.caloriasPor100g) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId) return;

        try {
            const request: CrearAlimentoRequest = {
                twinID: twinId, // Mapear twinId a twinID
                nombreAlimento: nuevoAlimento.nombre!, // Mapear nombre a nombreAlimento
                categoria: nuevoAlimento.categoria!, // Asegurar que no sea undefined
                caloriasPor100g: nuevoAlimento.caloriasPor100g,
                unidadComun: nuevoAlimento.unidadComun!, // Asegurar que no sea undefined
                cantidadComun: nuevoAlimento.cantidadComun || 1,
                descripcion: nuevoAlimento.descripcion,
                proteinas: nuevoAlimento.proteinas,
                carbohidratos: nuevoAlimento.carbohidratos,
                grasas: nuevoAlimento.grasas,
                fibra: nuevoAlimento.fibra
            };

            const response = await recetasApiService.crearAlimento(request);
            setAlimentos([response.alimento, ...alimentos]);
            resetearFormularioAlimento();
            setModalAlimentoAbierto(false);
        } catch (error) {
            console.error('Error creando alimento:', error);
            alert('Error al crear el alimento');
        }
    };

    const editarAlimento = (id: string) => {
        const alimento = alimentos.find(a => a.id === id);
        if (alimento) {
            console.log('🔍 Editando alimento completo:', JSON.stringify(alimento, null, 2));
            console.log('🔍 Valores específicos:');
            console.log('  - proteinas:', alimento.proteinas, 'tipo:', typeof alimento.proteinas);
            console.log('  - carbohidratos:', alimento.carbohidratos, 'tipo:', typeof alimento.carbohidratos);
            console.log('  - grasas:', alimento.grasas, 'tipo:', typeof alimento.grasas);
            console.log('  - fibra:', alimento.fibra, 'tipo:', typeof alimento.fibra);
            
            // Función auxiliar para convertir null/undefined a undefined, manteniendo 0 como válido
            const convertirValor = (valor: any): number | undefined => {
                if (valor === null || valor === undefined) return undefined;
                if (typeof valor === 'number') return valor;
                const parsed = parseFloat(valor);
                return isNaN(parsed) ? undefined : parsed;
            };
            
            // Mapear de AlimentoBase a FormularioAlimento
            const formularioData = {
                nombre: alimento.nombreAlimento,
                categoria: alimento.categoria,
                caloriasPor100g: alimento.caloriasPor100g,
                unidadComun: alimento.unidadComun,
                cantidadComun: alimento.cantidadComun,
                descripcion: alimento.descripcion || '',
                proteinas: convertirValor(alimento.proteinas),
                carbohidratos: convertirValor(alimento.carbohidratos),
                grasas: convertirValor(alimento.grasas),
                fibra: convertirValor(alimento.fibra)
            };
            
            console.log('📝 Datos mapeados para formulario:', JSON.stringify(formularioData, null, 2));
            console.log('⚠️ PROBLEMA: Los macronutrientes llegan como null desde el backend');
            console.log('⚠️ Esto indica un problema de mapeo en el backend C# -> JSON');
            
            setNuevoAlimento(formularioData);
            setAlimentoEditando(id);
            setModoEdicionAlimento(true);
            setModalAlimentoAbierto(true);
        }
    };

    const actualizarAlimento = async () => {
        if (!nuevoAlimento.nombre || !nuevoAlimento.caloriasPor100g) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId || !alimentoEditando) return;

        try {
            const request: ActualizarAlimentoRequest = {
                id: alimentoEditando,
                twinID: twinId,
                nombreAlimento: nuevoAlimento.nombre!,
                categoria: nuevoAlimento.categoria!,
                caloriasPor100g: nuevoAlimento.caloriasPor100g,
                unidadComun: nuevoAlimento.unidadComun!,
                cantidadComun: nuevoAlimento.cantidadComun || 1,
                descripcion: nuevoAlimento.descripcion,
                proteinas: nuevoAlimento.proteinas,
                carbohidratos: nuevoAlimento.carbohidratos,
                grasas: nuevoAlimento.grasas,
                fibra: nuevoAlimento.fibra
            };

            const response = await recetasApiService.actualizarAlimento(request);
            
            // Actualizar la lista de alimentos con el alimento modificado
            setAlimentos(alimentos.map(a => 
                a.id === alimentoEditando ? response.alimento : a
            ));
            
            resetearFormularioAlimento();
            setModalAlimentoAbierto(false);
            setModoEdicionAlimento(false);
            setAlimentoEditando(null);
        } catch (error) {
            console.error('Error actualizando alimento:', error);
            alert('Error al actualizar el alimento');
        }
    };

    const eliminarAlimento = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este alimento?')) {
            try {
                const twinId = getCurrentTwinId();
                if (!twinId) return;

                await recetasApiService.eliminarAlimento(id, twinId); // El servicio espera twinID pero lo llamamos con twinId
                setAlimentos(alimentos.filter(a => a.id !== id));
            } catch (error) {
                console.error('Error eliminando alimento:', error);
                alert('Error al eliminar el alimento');
            }
        }
    };

    // ===== MÉTODOS AUXILIARES =====

    const resetearFormularioReceta = () => {
        setNuevaReceta({
            nombre: '',
            descripcion: '',
            categoria: 'Almuerzo',
            dificultad: 'Fácil',
            tiempoPreparacion: 30,
            tiempoCoccion: 0,
            porciones: 4,
            ingredientes: [],
            pasos: [],
            consejos: [],
            etiquetas: []
        });
        setNuevoIngrediente({
            nombre: '',
            cantidad: 1,
            unidad: 'unidades',
            calorias: 0
        });
        setNuevoPaso({
            numero: 1,
            descripcion: '',
            tiempoEstimado: 5
        });
    };

    const resetearFormularioAlimento = () => {
        setNuevoAlimento({
            nombre: '',
            categoria: 'Frutas',
            caloriasPor100g: 0,
            unidadComun: 'unidades',
            cantidadComun: 1,
            descripcion: '',
            proteinas: 0,
            carbohidratos: 0,
            grasas: 0,
            fibra: 0
        });
    };

    const cancelarEdicionReceta = () => {
        setModalRecetaAbierto(false);
        setModoEdicionReceta(false);
        setRecetaEditando(null);
        resetearFormularioReceta();
    };

    const cancelarEdicionAlimento = () => {
        setModalAlimentoAbierto(false);
        setModoEdicionAlimento(false);
        setAlimentoEditando(null);
        resetearFormularioAlimento();
    };

    const agregarIngrediente = () => {
        if (!nuevoIngrediente.nombre || !nuevoIngrediente.cantidad) return;

        const ingrediente: IngredienteReceta = {
            id: `temp_${Date.now()}`,
            nombre: nuevoIngrediente.nombre,
            cantidad: nuevoIngrediente.cantidad,
            unidad: nuevoIngrediente.unidad as UnidadIngrediente,
            calorias: nuevoIngrediente.calorias || 0,
            esOpcional: nuevoIngrediente.esOpcional,
            notas: nuevoIngrediente.notas
        };

        setNuevaReceta({
            ...nuevaReceta,
            ingredientes: [...(nuevaReceta.ingredientes || []), ingrediente]
        });

        setNuevoIngrediente({
            nombre: '',
            cantidad: 1,
            unidad: 'unidades',
            calorias: 0
        });
    };

    const removerIngrediente = (index: number) => {
        const ingredientes = nuevaReceta.ingredientes || [];
        setNuevaReceta({
            ...nuevaReceta,
            ingredientes: ingredientes.filter((_, i) => i !== index)
        });
    };

    const agregarPaso = () => {
        if (!nuevoPaso.descripcion) return;

        const paso: PasoPreparacion = {
            numero: (nuevaReceta.pasos?.length || 0) + 1,
            descripcion: nuevoPaso.descripcion,
            tiempoEstimado: nuevoPaso.tiempoEstimado,
            temperatura: nuevoPaso.temperatura,
            consejo: nuevoPaso.consejo
        };

        setNuevaReceta({
            ...nuevaReceta,
            pasos: [...(nuevaReceta.pasos || []), paso]
        });

        setNuevoPaso({
            numero: 1,
            descripcion: '',
            tiempoEstimado: 5
        });
    };

    const removerPaso = (index: number) => {
        const pasos = nuevaReceta.pasos || [];
        const nuevospasos = pasos.filter((_, i) => i !== index)
            .map((paso, i) => ({ ...paso, numero: i + 1 }));
        
        setNuevaReceta({
            ...nuevaReceta,
            pasos: nuevospasos
        });
    };

    // Filtros
    const recetasFiltradas = recetas.filter(receta => {
        const coincideBusqueda = busquedaRecetas === '' || 
            receta.nombre.toLowerCase().includes(busquedaRecetas.toLowerCase()) ||
            receta.descripcion.toLowerCase().includes(busquedaRecetas.toLowerCase());
        
        const coincideCategoria = filtroRecetaCategoria === '' || 
            receta.categoria === filtroRecetaCategoria;
        
        return coincideBusqueda && coincideCategoria;
    });

    const alimentosFiltrados = alimentos.filter(alimento => {
        const coincideBusqueda = busquedaAlimentos === '' || 
            alimento.nombreAlimento.toLowerCase().includes(busquedaAlimentos.toLowerCase()); // Cambiado de nombre a nombreAlimento
        
        const coincideCategoria = filtroAlimentoCategoria === '' || 
            alimento.categoria === filtroAlimentoCategoria;
        
        return coincideBusqueda && coincideCategoria;
    });

    const formatearTiempo = (minutos: number) => {
        if (minutos < 60) return `${minutos}m`;
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
    };

    const getDificultadColor = (dificultad: DificultadReceta) => {
        switch (dificultad) {
            case 'Fácil': return 'bg-green-100 text-green-800';
            case 'Intermedio': return 'bg-yellow-100 text-yellow-800';
            case 'Difícil': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/twin-biografia')}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft size={20} />
                                Volver a Biografía
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <ChefHat size={28} className="text-green-600" />
                                    Recetas Saludables
                                </h1>
                                <p className="text-gray-600">Gestiona tus recetas favoritas y base de alimentos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards principales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Card de Recetas */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen size={24} className="text-green-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Mis Recetas</h2>
                                </div>
                                <Button
                                    onClick={() => setModalRecetaAbierto(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Nueva Receta
                                </Button>
                            </div>

                            {/* Filtros de recetas */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={busquedaRecetas}
                                            onChange={(e) => setBusquedaRecetas(e.target.value)}
                                            placeholder="Buscar recetas..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filtroRecetaCategoria}
                                    onChange={(e) => setFiltroRecetaCategoria(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categoriasReceta.map(categoria => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                    <span className="ml-2 text-gray-600">Cargando...</span>
                                </div>
                            ) : recetasFiltradas.length === 0 ? (
                                <div className="text-center py-8">
                                    <ChefHat size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">No hay recetas</h3>
                                    <p className="text-gray-500 mb-4">Comienza creando tu primera receta</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recetasFiltradas.map((receta) => (
                                        <div key={receta.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-gray-800">{receta.nombre}</h3>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => toggleFavorita(receta.id, !receta.esFavorita)}
                                                            className="p-1"
                                                        >
                                                            <Heart 
                                                                size={16} 
                                                                className={receta.esFavorita ? "text-red-500 fill-current" : "text-gray-400"} 
                                                            />
                                                        </Button>
                                                    </div>
                                                    
                                                    <p className="text-sm text-gray-600 mb-2">{receta.descripcion}</p>
                                                    
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            <span>{formatearTiempo(receta.tiempoTotal)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users size={12} />
                                                            <span>{receta.porciones} porciones</span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDificultadColor(receta.dificultad)}`}>
                                                            {receta.dificultad}
                                                        </span>
                                                        <span className="text-green-600 font-medium">
                                                            {receta.informacionNutricional.caloriasPorPorcion} kcal/porción
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-1 ml-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => editarReceta(receta.id)}
                                                    >
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => eliminarReceta(receta.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card de Alimentos */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Apple size={24} className="text-red-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Base de Alimentos</h2>
                                </div>
                                <Button
                                    onClick={() => setModalAlimentoAbierto(true)}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Nuevo Alimento
                                </Button>
                            </div>

                            {/* Filtros de alimentos */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={busquedaAlimentos}
                                            onChange={(e) => setBusquedaAlimentos(e.target.value)}
                                            placeholder="Buscar alimentos..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filtroAlimentoCategoria}
                                    onChange={(e) => setFiltroAlimentoCategoria(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categoriasAlimento.map(categoria => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="p-6 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                                    <span className="ml-2 text-gray-600">Cargando...</span>
                                </div>
                            ) : alimentosFiltrados.length === 0 ? (
                                <div className="text-center py-8">
                                    <Apple size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">No hay alimentos en el backend</h3>
                                    <p className="text-gray-500 mb-4">
                                        Los alimentos se cargan desde la API del backend.<br/>
                                        Verifica que el servidor esté funcionando correctamente.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {alimentosFiltrados.map((alimento) => (
                                        <div key={alimento.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-gray-800">{alimento.nombreAlimento}</h4> {/* Cambiado de nombre a nombreAlimento */}
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            {alimento.categoria}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>
                                                            <strong>{alimento.caloriasUnidadComun}</strong> kcal por {alimento.cantidadComun} {alimento.unidadComun}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            ({alimento.caloriasPor100g} kcal/100g)
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => editarAlimento(alimento.id)}
                                                    >
                                                        <Edit size={12} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => eliminarAlimento(alimento.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para Recetas - Lo voy a completar en la siguiente parte */}
            {modalRecetaAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        {/* Header del modal */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <ChefHat size={28} className="text-green-600" />
                                    {modoEdicionReceta ? 'Editar Receta' : 'Nueva Receta'}
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelarEdicionReceta}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* El contenido del modal para recetas será muy extenso, lo completaré en el siguiente mensaje */}
                        <div className="p-6">
                            <p className="text-center text-gray-500 py-8">
                                Modal de recetas en construcción - será completado en la siguiente parte
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Alimentos - También será completado */}
            {modalAlimentoAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Header del modal */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <Apple size={28} className="text-red-600" />
                                    {modoEdicionAlimento ? 'Editar Alimento' : 'Nuevo Alimento'}
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelarEdicionAlimento}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Contenido del modal de alimentos */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Campos básicos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Alimento *</label>
                                        <input
                                            type="text"
                                            value={nuevoAlimento.nombre}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, nombre: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Ej: Banana, Pollo, Arroz..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                                        <select
                                            value={nuevoAlimento.categoria}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, categoria: e.target.value as CategoriaAlimento})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        >
                                            {categoriasAlimento.map(categoria => (
                                                <option key={categoria} value={categoria}>{categoria}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Información nutricional */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Calorías por 100g *</label>
                                        <input
                                            type="number"
                                            value={nuevoAlimento.caloriasPor100g}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, caloriasPor100g: parseInt(e.target.value) || 0})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Unidad Común</label>
                                        <select
                                            value={nuevoAlimento.unidadComun}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, unidadComun: e.target.value as UnidadIngrediente})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        >
                                            {unidadesIngrediente.map(unidad => (
                                                <option key={unidad} value={unidad}>{unidad}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Común</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={nuevoAlimento.cantidadComun}
                                        onChange={(e) => setNuevoAlimento({...nuevoAlimento, cantidadComun: parseFloat(e.target.value) || 1})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        min="0.1"
                                    />
                                </div>

                                {/* Macronutrientes opcionales */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Proteínas (g)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={nuevoAlimento.proteinas !== undefined ? nuevoAlimento.proteinas : ''}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, proteinas: parseFloat(e.target.value) || undefined})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Carbohidratos (g)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={nuevoAlimento.carbohidratos !== undefined ? nuevoAlimento.carbohidratos : ''}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, carbohidratos: parseFloat(e.target.value) || undefined})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Grasas (g)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={nuevoAlimento.grasas !== undefined ? nuevoAlimento.grasas : ''}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, grasas: parseFloat(e.target.value) || undefined})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fibra (g)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={nuevoAlimento.fibra !== undefined ? nuevoAlimento.fibra : ''}
                                            onChange={(e) => setNuevoAlimento({...nuevoAlimento, fibra: parseFloat(e.target.value) || undefined})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                    <textarea
                                        value={nuevoAlimento.descripcion || ''}
                                        onChange={(e) => setNuevoAlimento({...nuevoAlimento, descripcion: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Información adicional sobre el alimento..."
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={modoEdicionAlimento ? actualizarAlimento : crearAlimento}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        disabled={!nuevoAlimento.nombre || !nuevoAlimento.caloriasPor100g}
                                    >
                                        <Save size={16} className="mr-2" />
                                        {modoEdicionAlimento ? 'Guardar Cambios' : 'Crear Alimento'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={cancelarEdicionAlimento}
                                    >
                                        <X size={16} className="mr-2" />
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecetasSaludablesPage;
