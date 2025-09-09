import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Plus,
    Calendar,
    Target,
    Edit,
    Trash2,
    Save,
    X,
    Search,
    Utensils,
    Coffee,
    Clock,
    Apple,
    ChefHat
} from "lucide-react";

// Importar tipos
import {
    RegistroComida,
    TipoComida,
    AlimentoConsumido,
    AlimentoBase,
    alimentosComunes,
    CrearRegistroComidaRequest
} from "@/types/alimentacion.types";

// Importar servicio API
import { alimentacionApiService } from "@/services/alimentacionApiService";
import { recetasApiService } from "@/services/recetasApiService";

const DiarioAlimentacionPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    // Estados principales
    const [registros, setRegistros] = useState<RegistroComida[]>([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [registroEditando, setRegistroEditando] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Estado para alimentos desde backend
    const [alimentosBackend, setAlimentosBackend] = useState<AlimentoBase[]>([]);
    const [cargandoAlimentos, setCargandoAlimentos] = useState(false);
    
    // Estados para filtros
    const [filtroFecha, setFiltroFecha] = useState('');
    const [filtroTipoComida, setFiltroTipoComida] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Estado para nuevo registro
    const [nuevoRegistro, setNuevoRegistro] = useState<Partial<RegistroComida>>({
        fecha: new Date().toISOString().split('T')[0],
        tipoComida: 'Desayuno',
        alimentos: [],
        notas: ''
    });

    // Estado para agregar alimentos
    const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<string>('');
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1);

    const getCurrentTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
    };

    // Función para obtener el peso promedio de una unidad basado en el tipo de alimento
    const obtenerPesoPromedioUnidad = (nombre: string, categoria: string): number => {
        const nombreLower = nombre.toLowerCase();
        
        // Pesos promedio en gramos por unidad
        if (categoria === 'Frutas') {
            if (nombreLower.includes('banana') || nombreLower.includes('plátano')) return 120;
            if (nombreLower.includes('manzana')) return 180;
            if (nombreLower.includes('naranja')) return 150;
            if (nombreLower.includes('pera')) return 170;
            if (nombreLower.includes('kiwi')) return 70;
            if (nombreLower.includes('durazno') || nombreLower.includes('melocotón')) return 150;
            return 100; // Peso promedio genérico para frutas
        }
        
        if (categoria === 'Verduras') {
            if (nombreLower.includes('tomate')) return 120;
            if (nombreLower.includes('cebolla')) return 100;
            if (nombreLower.includes('zanahoria')) return 80;
            if (nombreLower.includes('papa') || nombreLower.includes('patata')) return 150;
            return 80; // Peso promedio genérico para verduras
        }
        
        if (categoria === 'Proteínas') {
            if (nombreLower.includes('huevo')) return 50;
            if (nombreLower.includes('pollo') || nombreLower.includes('pechuga')) return 100;
            return 100; // Peso promedio genérico para proteínas por porción
        }
        
        // Para otros casos, usar el valor de cantidadComun como referencia o 100g por defecto
        return 100;
    };

    // Cargar registros y alimentos al inicializar
    useEffect(() => {
        cargarRegistros();
        cargarAlimentosDelBackend();
    }, []);

    const cargarAlimentosDelBackend = async () => {
        try {
            setCargandoAlimentos(true);
            const twinId = getCurrentTwinId();
            
            if (!twinId) {
                console.warn('⚠️ No hay twinId válido para cargar alimentos');
                setAlimentosBackend([]);
                return;
            }

            console.log('🍎 Cargando alimentos desde backend para diario alimentación...', { twinId });
            
            const response = await recetasApiService.obtenerAlimentos({
                twinID: twinId,
                limite: 100 // Cargar muchos alimentos para el combobox
            });

            console.log('📦 Respuesta del backend:', response);

            if (response.exito && response.alimentos) {
                console.log('✅ Alimentos cargados para diario:', response.alimentos.length);
                
                // Mapear de AlimentoBase (recetas) a AlimentoBase (alimentación)
                const alimentosMapeados = response.alimentos.map(alimento => {
                    // Debug: Mostrar datos originales del backend
                    console.log(`🔍 Backend data para ${alimento.nombreAlimento}:`, {
                        caloriasUnidadComun: alimento.caloriasUnidadComun,
                        caloriasPor100g: alimento.caloriasPor100g,
                        cantidadComun: alimento.cantidadComun,
                        unidadComun: alimento.unidadComun
                    });

                    // Calcular calorías por unidad común correctamente
                    let caloriasUnidadComun = alimento.caloriasUnidadComun;
                    
                    // Si caloriasUnidadComun es menor a 10 (valores como 0.9 son incorrectos), recalcular
                    if (!caloriasUnidadComun || caloriasUnidadComun < 10) {
                        console.log(`🔧 Recalculando calorías para ${alimento.nombreAlimento} (valor original: ${alimento.caloriasUnidadComun})`);
                        
                        // Para la mayoría de frutas/alimentos, asumir que 1 unidad = peso promedio
                        // Banana promedio = ~120g, Manzana = ~180g, etc.
                        const pesoPromedioUnidad = obtenerPesoPromedioUnidad(alimento.nombreAlimento, alimento.categoria);
                        caloriasUnidadComun = Math.round((alimento.caloriasPor100g * pesoPromedioUnidad) / 100);
                    }
                    
                    console.log(`🔢 Calorías finales para ${alimento.nombreAlimento}:`, {
                        caloriasPor100g: alimento.caloriasPor100g,
                        cantidadComun: alimento.cantidadComun,
                        unidadComun: alimento.unidadComun,
                        caloriasFinales: caloriasUnidadComun
                    });
                    
                    return {
                        id: alimento.id,
                        nombre: alimento.nombreAlimento,
                        categoria: alimento.categoria as any,
                        caloriasPor100g: alimento.caloriasPor100g,
                        proteinas: alimento.proteinas,
                        carbohidratos: alimento.carbohidratos,
                        grasas: alimento.grasas,
                        fibra: alimento.fibra,
                        unidadComun: alimento.unidadComun as any,
                        cantidadComun: alimento.cantidadComun,
                        caloriasUnidadComun: caloriasUnidadComun
                    };
                });
                
                setAlimentosBackend(alimentosMapeados);
            } else {
                console.warn('⚠️ Backend no devolvió alimentos o response.exito = false');
                setAlimentosBackend([]);
            }
        } catch (error) {
            console.error('❌ Error cargando alimentos para diario:', error);
            // Si falla, usar alimentos por defecto
            setAlimentosBackend([]);
        } finally {
            console.log('🏁 Finalizando carga de alimentos');
            setCargandoAlimentos(false);
        }
    };

    const cargarRegistros = async () => {
        setLoading(true);
        try {
            const twinId = getCurrentTwinId();
            const filtros = { twinId: twinId! };
            const response = await alimentacionApiService.obtenerRegistros(filtros);
            setRegistros(response.registros);
        } catch (error) {
            console.error('Error cargando registros:', error);
        } finally {
            setLoading(false);
        }
    };

    const crearRegistro = async () => {
        if (!nuevoRegistro.tipoComida || !nuevoRegistro.alimentos || nuevoRegistro.alimentos.length === 0) {
            alert('Por favor selecciona el tipo de comida y agrega al menos un alimento');
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId) return;

        const request: CrearRegistroComidaRequest = {
            twinId,
            fecha: nuevoRegistro.fecha || new Date().toISOString().split('T')[0],
            tipoComida: nuevoRegistro.tipoComida as TipoComida,
            alimentos: nuevoRegistro.alimentos,
            notas: nuevoRegistro.notas,
            horaComida: nuevoRegistro.horaComida
        };

        try {
            const response = await alimentacionApiService.crearRegistro(request);
            setRegistros([...registros, response.registro]);
            resetearFormulario();
            setModalAbierto(false);
        } catch (error) {
            console.error('Error creando registro:', error);
            alert('Error al crear el registro');
        }
    };

    const editarRegistro = (id: string) => {
        const registro = registros.find(r => r.id === id);
        if (registro) {
            setNuevoRegistro(registro);
            setRegistroEditando(id);
            setModoEdicion(true);
            setModalAbierto(true);
        }
    };

    const guardarEdicion = async () => {
        if (!registroEditando) return;

        const twinId = getCurrentTwinId();
        if (!twinId) return;

        try {
            const response = await alimentacionApiService.actualizarRegistro({
                id: registroEditando,
                twinId,
                fecha: nuevoRegistro.fecha!,
                tipoComida: nuevoRegistro.tipoComida as TipoComida,
                alimentos: nuevoRegistro.alimentos!,
                notas: nuevoRegistro.notas,
                horaComida: nuevoRegistro.horaComida
            });

            setRegistros(registros.map(r => 
                r.id === registroEditando ? response.registro : r
            ));
            
            cancelarEdicion();
        } catch (error) {
            console.error('Error actualizando registro:', error);
            alert('Error al actualizar el registro');
        }
    };

    const eliminarRegistro = async (id: string) => {
        if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
            try {
                const twinId = getCurrentTwinId();
                if (!twinId) return;
                
                await alimentacionApiService.eliminarRegistro(id, twinId);
                setRegistros(registros.filter(r => r.id !== id));
            } catch (error) {
                console.error('Error eliminando registro:', error);
                alert('Error al eliminar el registro');
            }
        }
    };

    const cancelarEdicion = () => {
        setModalAbierto(false);
        setModoEdicion(false);
        setRegistroEditando(null);
        resetearFormulario();
    };

    const resetearFormulario = () => {
        setNuevoRegistro({
            fecha: new Date().toISOString().split('T')[0],
            tipoComida: 'Desayuno',
            alimentos: [],
            notas: ''
        });
        setAlimentoSeleccionado('');
        setCantidadSeleccionada(1);
    };

    const agregarAlimento = () => {
        if (!alimentoSeleccionado) return;

        // Buscar primero en alimentos del backend
        let alimentoPredefinido = alimentosBackend.find((a) => a.nombre === alimentoSeleccionado);
        
        // Si no se encuentra en backend, buscar en alimentos por defecto
        if (!alimentoPredefinido) {
            alimentoPredefinido = alimentosComunes.find((a: AlimentoBase) => a.nombre === alimentoSeleccionado);
        }
        
        if (!alimentoPredefinido) return;

        const caloriasCalculadas = Math.round(alimentoPredefinido.caloriasUnidadComun * cantidadSeleccionada);
        
        console.log(`🍽️ Agregando alimento:`, {
            nombre: alimentoPredefinido.nombre,
            cantidad: cantidadSeleccionada,
            caloriasUnidadComun: alimentoPredefinido.caloriasUnidadComun,
            caloriasTotal: caloriasCalculadas
        });

        const nuevoAlimento: AlimentoConsumido = {
            alimentoId: alimentoPredefinido.id,
            nombreAlimento: alimentoPredefinido.nombre,
            cantidad: cantidadSeleccionada,
            unidad: alimentoPredefinido.unidadComun,
            calorias: caloriasCalculadas
        };

        console.log('🍎 Agregando alimento al registro:', nuevoAlimento);

        const alimentosActuales = nuevoRegistro.alimentos || [];
        setNuevoRegistro({
            ...nuevoRegistro,
            alimentos: [...alimentosActuales, nuevoAlimento]
        });

        setAlimentoSeleccionado('');
        setCantidadSeleccionada(1);
    };

    const removerAlimento = (index: number) => {
        const alimentosActuales = nuevoRegistro.alimentos || [];
        setNuevoRegistro({
            ...nuevoRegistro,
            alimentos: alimentosActuales.filter((_, i) => i !== index)
        });
    };

    // Filtros
    const registrosFiltrados = registros.filter(registro => {
        const coincideBusqueda = busqueda === '' || 
            registro.alimentos.some((a: AlimentoConsumido) => a.nombreAlimento.toLowerCase().includes(busqueda.toLowerCase())) ||
            (registro.notas && registro.notas.toLowerCase().includes(busqueda.toLowerCase()));
        
        const coincideTipo = filtroTipoComida === '' || registro.tipoComida === filtroTipoComida;
        
        const coincideFecha = filtroFecha === '' || 
            registro.fecha.startsWith(filtroFecha);
        
        return coincideBusqueda && coincideTipo && coincideFecha;
    });

    // Estadísticas
    const hoy = new Date().toISOString().split('T')[0];
    const registrosHoy = registros.filter(r => r.fecha === hoy);
    const caloriasHoy = registrosHoy.reduce((total, r) => 
        total + r.alimentos.reduce((subtotal, a) => subtotal + a.calorias, 0), 0
    );
    const comidasHoy = registrosHoy.length;

    const getTipoComidaIcon = (tipo: TipoComida) => {
        switch (tipo) {
            case 'Desayuno': return <Coffee size={20} className="text-orange-600" />;
            case 'Almuerzo': return <Utensils size={20} className="text-green-600" />;
            case 'Cena': return <ChefHat size={20} className="text-purple-600" />;
            case 'Snack Nocturno': return <Apple size={20} className="text-red-600" />;
            case 'Media Mañana': return <Apple size={20} className="text-yellow-600" />;
            case 'Merienda': return <Apple size={20} className="text-blue-600" />;
            default: return <Utensils size={20} className="text-gray-600" />;
        }
    };

    const getTipoComidaColor = (tipo: TipoComida) => {
        switch (tipo) {
            case 'Desayuno': return 'bg-orange-100 text-orange-800';
            case 'Almuerzo': return 'bg-green-100 text-green-800';
            case 'Cena': return 'bg-purple-100 text-purple-800';
            case 'Snack Nocturno': return 'bg-red-100 text-red-800';
            case 'Media Mañana': return 'bg-yellow-100 text-yellow-800';
            case 'Merienda': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatearHora = (hora: string) => {
        return new Date(`2000-01-01T${hora}`).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
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
                                    <Utensils size={28} className="text-green-600" />
                                    Diario de Alimentación
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={() => setModalAbierto(true)}
                            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Nueva Comida
                        </Button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Comidas Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{comidasHoy}</p>
                            </div>
                            <Target className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Calorías Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{caloriasHoy.toLocaleString()}</p>
                            </div>
                            <Apple className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Promedio Calorías</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {registros.length > 0 ? Math.round(
                                        registros.reduce((total, r) => 
                                            total + r.alimentos.reduce((subtotal, a) => subtotal + a.calorias, 0), 0
                                        ) / registros.length
                                    ) : 0}
                                </p>
                            </div>
                            <ChefHat className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Filtros y búsqueda */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        placeholder="Buscar por alimento o notas..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <input
                                    type="month"
                                    value={filtroFecha}
                                    onChange={(e) => setFiltroFecha(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                
                                <select
                                    value={filtroTipoComida}
                                    onChange={(e) => setFiltroTipoComida(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="Desayuno">Desayuno</option>
                                    <option value="Media Mañana">Media Mañana</option>
                                    <option value="Almuerzo">Almuerzo</option>
                                    <option value="Merienda">Merienda</option>
                                    <option value="Cena">Cena</option>
                                    <option value="Snack Nocturno">Snack Nocturno</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lista de registros */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <span className="ml-2 text-gray-600">Cargando registros...</span>
                            </div>
                        ) : registrosFiltrados.length === 0 ? (
                            <div className="text-center py-12">
                                <Utensils size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No hay registros de comidas</h3>
                                <p className="text-gray-500 mb-4">Comienza registrando tu primera comida del día</p>
                                <Button
                                    onClick={() => setModalAbierto(true)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Agregar Primera Comida
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {registrosFiltrados.map((registro) => (
                                    <div key={registro.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {getTipoComidaIcon(registro.tipoComida)}
                                                    <h3 className="font-semibold text-gray-800 capitalize">{registro.tipoComida}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoComidaColor(registro.tipoComida)}`}>
                                                        {registro.alimentos.reduce((total, a) => total + a.calorias, 0)} kcal
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} />
                                                        <span>{new Date(registro.fecha).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                    {registro.horaComida && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={16} />
                                                            <span>{formatearHora(registro.horaComida)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Apple size={16} />
                                                        <span>{registro.alimentos.length} alimentos</span>
                                                    </div>
                                                </div>

                                                {/* Lista de alimentos */}
                                                <div className="mb-3">
                                                    <h4 className="font-medium text-gray-700 mb-2">Alimentos:</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {registro.alimentos.map((alimento, index) => (
                                                            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                                                <span className="text-sm">
                                                                    {alimento.cantidad} {alimento.unidad} de {alimento.nombreAlimento}
                                                                </span>
                                                                <span className="text-sm font-medium text-green-600">
                                                                    {alimento.calorias} kcal
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {registro.notas && (
                                                    <p className="text-sm text-gray-600 italic">{registro.notas}</p>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => editarRegistro(registro.id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => eliminarRegistro(registro.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={16} />
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

            {/* Modal responsive para nueva comida */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Header del modal */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <Plus size={28} className="text-green-600" />
                                    {modoEdicion ? 'Editar Comida' : 'Nueva Comida'}
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelarEdicion}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Campos básicos */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                                        <input
                                            type="date"
                                            value={nuevoRegistro.fecha}
                                            onChange={(e) => setNuevoRegistro({...nuevoRegistro, fecha: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Comida *</label>
                                        <select
                                            value={nuevoRegistro.tipoComida}
                                            onChange={(e) => setNuevoRegistro({...nuevoRegistro, tipoComida: e.target.value as TipoComida})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="Desayuno">Desayuno</option>
                                            <option value="Media Mañana">Media Mañana</option>
                                            <option value="Almuerzo">Almuerzo</option>
                                            <option value="Merienda">Merienda</option>
                                            <option value="Cena">Cena</option>
                                            <option value="Snack Nocturno">Snack Nocturno</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                                        <input
                                            type="time"
                                            value={nuevoRegistro.horaComida || ''}
                                            onChange={(e) => setNuevoRegistro({...nuevoRegistro, horaComida: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Agregar alimentos */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Agregar Alimentos</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Alimento</label>
                                            <select
                                                value={alimentoSeleccionado}
                                                onChange={(e) => setAlimentoSeleccionado(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                disabled={cargandoAlimentos}
                                            >
                                                <option value="">
                                                    {cargandoAlimentos ? 'Cargando alimentos...' : 'Seleccionar alimento'}
                                                </option>
                                                {/* Alimentos del backend */}
                                                {alimentosBackend.length > 0 && alimentosBackend.map((alimento) => (
                                                    <option key={alimento.id} value={alimento.nombre}>
                                                        {alimento.nombre} ({alimento.caloriasUnidadComun} kcal por {alimento.unidadComun})
                                                    </option>
                                                ))}
                                                {/* Fallback a alimentos por defecto si no hay del backend */}
                                                {alimentosBackend.length === 0 && !cargandoAlimentos && alimentosComunes.map((alimento: AlimentoBase) => (
                                                    <option key={alimento.nombre} value={alimento.nombre}>
                                                        {alimento.nombre} ({alimento.caloriasUnidadComun} kcal por {alimento.unidadComun})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={cantidadSeleccionada}
                                                onChange={(e) => setCantidadSeleccionada(parseFloat(e.target.value) || 1)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                onClick={agregarAlimento}
                                                disabled={!alimentoSeleccionado}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                <Plus size={16} className="mr-2" />
                                                Agregar
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Lista de alimentos agregados */}
                                    {nuevoRegistro.alimentos && nuevoRegistro.alimentos.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-2">Alimentos agregados:</h4>
                                            <div className="space-y-2">
                                                {nuevoRegistro.alimentos.map((alimento, index) => (
                                                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                                        <span>
                                                            {alimento.cantidad} {alimento.unidad} de {alimento.nombreAlimento}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-green-600">
                                                                {alimento.calorias} kcal
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => removerAlimento(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <X size={14} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-right">
                                                <span className="text-lg font-bold text-gray-800">
                                                    Total: {nuevoRegistro.alimentos.reduce((total, a) => total + a.calorias, 0)} kcal
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas
                                    </label>
                                    <textarea
                                        value={nuevoRegistro.notas || ''}
                                        onChange={(e) => setNuevoRegistro({...nuevoRegistro, notas: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Observaciones, sentimientos, contexto de la comida..."
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={modoEdicion ? guardarEdicion : crearRegistro}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        disabled={!nuevoRegistro.alimentos || nuevoRegistro.alimentos.length === 0}
                                    >
                                        <Save size={16} className="mr-2" />
                                        {modoEdicion ? 'Guardar Cambios' : 'Crear Registro'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={cancelarEdicion}
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

export default DiarioAlimentacionPage;
