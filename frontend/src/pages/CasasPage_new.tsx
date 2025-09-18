import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAgentCreateHome, HomeData } from '@/services/casaAgentApiService';
import { 
    ArrowLeft, 
    Plus, 
    Home, 
    MapPin, 
    Calendar, 
    Eye, 
    Bed,
    Bath,
    Ruler,
    Building,
    Star,
    Clock,
    DollarSign,
    Edit,
    Car,
    Users,
    Loader2
} from 'lucide-react';

const CasasPage: React.FC = () => {
    const { accounts } = useMsal();
    const navigate = useNavigate();
    const { obtenerCasas } = useAgentCreateHome();
    const [casas, setCasas] = useState<HomeData[]>([]);
    const [tipoActivo, setTipoActivo] = useState<'actual' | 'pasado' | 'mudanza' | 'todos'>('todos');
    const [loading, setLoading] = useState(true);

    // Obtener twinId del usuario autenticado
    const twinId = accounts[0]?.localAccountId;

    // Cargar casas desde el backend
    useEffect(() => {
        const cargarCasas = async () => {
            if (!twinId) {
                console.warn('⚠️ No hay twinId disponible');
                setLoading(false);
                return;
            }

            try {
                console.log('🏠 Cargando casas desde backend para twin:', twinId);
                
                // Aplicar filtro si no es 'todos'
                const filters = tipoActivo !== 'todos' ? { tipo: tipoActivo } : undefined;
                const casasFromAPI = await obtenerCasas(twinId, filters);
                
                console.log('✅ Casas cargadas desde backend:', casasFromAPI);
                setCasas(casasFromAPI);
            } catch (error) {
                console.error('❌ Error al cargar casas desde backend:', error);
                // En caso de error, mostrar mensaje o array vacío
                setCasas([]);
            } finally {
                setLoading(false);
            }
        };

        cargarCasas();
    }, [twinId, obtenerCasas, tipoActivo]);

    // Filtrar casas por tipo (solo para UI, el filtro real se hace en el backend)
    const obtenerCasasPorTipo = (tipo: 'actual' | 'pasado' | 'mudanza' | 'todos') => {
        if (tipo === 'todos') {
            return casas;
        }
        return casas.filter(c => c.tipo === tipo);
    };

    // Formatear precio para mostrar
    const formatearPrecio = (precio?: number) => {
        if (!precio) return 'No disponible';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(precio);
    };

    // Formatear fecha
    const formatearFecha = (fecha: string) => {
        if (!fecha) return 'No disponible';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Obtener badge de tipo de casa
    const getBadgeTipo = (tipo: string) => {
        const badges = {
            'actual': { bg: 'bg-green-100', text: 'text-green-800', label: 'Actual' },
            'pasado': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pasado' },
            'mudanza': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Mudanza' }
        };
        
        const badge = badges[tipo as keyof typeof badges] || badges.actual;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    // Renderizar card de casa
    const renderCardCasa = (casa: HomeData) => {
        return (
            <div key={casa.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Imagen principal */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    {casa.fotos && casa.fotos.length > 0 ? (
                        <img 
                            src={casa.fotos[0]} 
                            alt={casa.direccion}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Home className="w-16 h-16 text-blue-300" />
                    )}
                </div>

                {/* Contenido de la card */}
                <div className="p-6">
                    {/* Header con tipo y principal */}
                    <div className="flex items-center justify-between mb-3">
                        {getBadgeTipo(casa.tipo)}
                        {casa.esPrincipal && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Principal
                            </span>
                        )}
                    </div>

                    {/* Dirección */}
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {casa.tipoPropiedad.charAt(0).toUpperCase() + casa.tipoPropiedad.slice(1)}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                                {casa.direccion}, {casa.ciudad}, {casa.estado} {casa.codigoPostal}
                            </span>
                        </div>
                    </div>

                    {/* Características principales */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <Bed className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{casa.habitaciones} hab</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Bath className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{casa.banos}.{casa.medioBanos} baños</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <Ruler className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{casa.areaTotal.toLocaleString()} ft²</span>
                        </div>
                        {casa.espaciosEstacionamiento > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                                <Car className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{casa.espaciosEstacionamiento} espacios</span>
                            </div>
                        )}
                    </div>

                    {/* Fechas */}
                    <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Desde: {formatearFecha(casa.fechaInicio)}</span>
                        </div>
                        {casa.fechaFin && (
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span>Hasta: {formatearFecha(casa.fechaFin)}</span>
                            </div>
                        )}
                    </div>

                    {/* Valor estimado */}
                    {casa.valorEstimado && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-900">Valor Estimado</span>
                                <span className="text-lg font-bold text-green-900">
                                    {formatearPrecio(casa.valorEstimado)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Descripción */}
                    {casa.descripcion && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {casa.descripcion}
                        </p>
                    )}

                    {/* Vecindario */}
                    {casa.vecindario && (
                        <div className="mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Building className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{casa.vecindario}</span>
                            </div>
                        </div>
                    )}

                    {/* Scores */}
                    {(casa.walkScore || casa.bikeScore) && (
                        <div className="flex gap-4 mb-4">
                            {casa.walkScore && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>Walk: {casa.walkScore}</span>
                                </div>
                            )}
                            {casa.bikeScore && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                                    <span>Bike: {casa.bikeScore}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/mi-patrimonio/casas/${casa.id}/ver`)}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver
                        </button>
                        <button
                            onClick={() => navigate(`/mi-patrimonio/casas/${casa.id}/editar`)}
                            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const tiposFilter = [
        { value: 'todos', label: 'Todas las Propiedades', icon: Home },
        { value: 'actual', label: 'Residencia Actual', icon: Home },
        { value: 'pasado', label: 'Residencias Pasadas', icon: Clock },
        { value: 'mudanza', label: 'En Proceso de Mudanza', icon: Building }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando casas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/mi-patrimonio/twin-hogar')}
                                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Twin Hogar
                            </button>
                            <span className="text-gray-400">/</span>
                            <span className="font-medium text-gray-900">Mis Casas</span>
                        </div>

                        {/* Botón agregar */}
                        <button
                            onClick={() => navigate('/mi-patrimonio/casas/crear')}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Agregar Casa
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Filtrar por Tipo</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {tiposFilter.map((tipo) => {
                            const Icon = tipo.icon;
                            const isActive = tipoActivo === tipo.value;
                            return (
                                <button
                                    key={tipo.value}
                                    onClick={() => setTipoActivo(tipo.value as any)}
                                    className={`flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                        isActive 
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {tipo.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Total de Propiedades</p>
                                <p className="text-2xl font-bold text-gray-900">{casas.length}</p>
                            </div>
                            <Home className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Propiedades Actuales</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {casas.filter(c => c.tipo === 'actual').length}
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600">Valor Total Estimado</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatearPrecio(casas.reduce((sum, casa) => sum + (casa.valorEstimado || 0), 0))}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Lista de casas */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {tipoActivo === 'todos' && 'Todas las Propiedades'}
                            {tipoActivo === 'actual' && 'Residencias Actuales'}
                            {tipoActivo === 'pasado' && 'Residencias Pasadas'}
                            {tipoActivo === 'mudanza' && 'En Proceso de Mudanza'}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {obtenerCasasPorTipo(tipoActivo).length} propiedad(es)
                        </span>
                    </div>

                    {obtenerCasasPorTipo(tipoActivo).length === 0 ? (
                        <div className="text-center py-12">
                            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay propiedades
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {tipoActivo === 'todos' 
                                    ? 'Aún no has agregado ninguna propiedad.'
                                    : `No tienes propiedades del tipo "${tipoActivo}".`
                                }
                            </p>
                            <button
                                onClick={() => navigate('/mi-patrimonio/casas/crear')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Agregar Primera Casa
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {obtenerCasasPorTipo(tipoActivo).map(renderCardCasa)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CasasPage;
