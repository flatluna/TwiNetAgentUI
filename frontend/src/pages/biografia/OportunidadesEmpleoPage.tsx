import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { oportunidadesApiService, type OportunidadEmpleo } from "@/services/oportunidadesApiService";
import { useMsal } from "@azure/msal-react";
import { 
    ArrowLeft,
    Target,
    Plus,
    Building,
    MapPin,
    DollarSign,
    Calendar,
    Edit,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    Briefcase,
    Users,
    Mail,
    Save,
    X,
    AlertCircle,
    ExternalLink
} from "lucide-react";

const OportunidadesEmpleoPage: React.FC = () => {
    const navigate = useNavigate();
    const { accounts } = useMsal();
    
    // Estados
    const [oportunidades, setOportunidades] = useState<OportunidadEmpleo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current user's twinId
    const getCurrentTwinId = () => {
        if (accounts.length > 0) {
            const account = accounts[0];
            return account.localAccountId;
        }
        return null;
    };

    // Cargar oportunidades al montar el componente
    useEffect(() => {
        loadOportunidades();
    }, []);

    const loadOportunidades = async () => {
        const twinId = getCurrentTwinId();
        console.log('🔍 TwinID obtenido en lista:', twinId);
        
        if (!twinId) {
            setError('No se pudo obtener el ID del usuario');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('💼 Cargando oportunidades para twin:', twinId);
            const data: any = await oportunidadesApiService.getJobOpportunities(twinId);
            console.log('📋 Datos recibidos del API:', data);
            
            // El API devuelve un objeto con la propiedad Opportunities
            let opportunities = [];
            if (data && data.Opportunities && Array.isArray(data.Opportunities)) {
                opportunities = data.Opportunities.map((opp: any) => ({
                    ...opp,
                    // Normalizar el estado a minúsculas
                    estado: opp.estado?.toLowerCase() || 'aplicado'
                }));
            }
            
            console.log('🔧 Oportunidades procesadas:', opportunities);
            setOportunidades(opportunities);
        } catch (err) {
            console.error('Error cargando oportunidades:', err);
            setError('Error al cargar las oportunidades de empleo');
            // Sin datos mock - mostrar array vacío
            setOportunidades([]);
        } finally {
            setLoading(false);
        }
    };

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [oportunidadSeleccionada, setOportunidadSeleccionada] = useState<OportunidadEmpleo | null>(null);
    const [modoEdicion, setModoEdicion] = useState(false);

    const [formData, setFormData] = useState({
        empresa: '',
        puesto: '',
        descripcion: '',
        responsabilidades: '',
        habilidadesRequeridas: '',
        salario: '',
        beneficios: '',
        ubicacion: '',
        fechaAplicacion: '',
        estado: 'aplicado' as OportunidadEmpleo['estado'],
        URLCompany: '',
        contactoNombre: '',
        contactoEmail: '',
        contactoTelefono: '',
        notas: ''
    });

    const estadoConfig = {
        aplicado: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Aplicado' },
        entrevista: { color: 'bg-yellow-100 text-yellow-800', icon: Users, label: 'En Entrevista' },
        esperando: { color: 'bg-purple-100 text-purple-800', icon: Clock, label: 'Esperando' },
        rechazado: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
        aceptado: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aceptado' },
        interesado: { color: 'bg-orange-100 text-orange-800', icon: Target, label: 'Interesado' }
    };

    const formatearFechaParaInput = (fecha: string): string => {
        try {
            // Convertir a formato yyyy-MM-dd para input de tipo date
            const date = new Date(fecha);
            return date.toISOString().split('T')[0];
        } catch {
            return fecha;
        }
    };

    const estadisticas = {
        total: Array.isArray(oportunidades) ? oportunidades.length : 0,
        aplicadas: Array.isArray(oportunidades) ? oportunidades.filter(o => o.estado === 'aplicado').length : 0,
        entrevistas: Array.isArray(oportunidades) ? oportunidades.filter(o => o.estado === 'entrevista').length : 0,
        aceptadas: Array.isArray(oportunidades) ? oportunidades.filter(o => o.estado === 'aceptado').length : 0,
        interesadas: Array.isArray(oportunidades) ? oportunidades.filter(o => o.estado === 'interesado').length : 0
    };

    const handleNuevaOportunidad = () => {
        setFormData({
            empresa: '',
            puesto: '',
            descripcion: '',
            responsabilidades: '',
            habilidadesRequeridas: '',
            salario: '',
            beneficios: '',
            ubicacion: '',
            fechaAplicacion: new Date().toISOString().split('T')[0],
            estado: 'aplicado',
            URLCompany: '',
            contactoNombre: '',
            contactoEmail: '',
            contactoTelefono: '',
            notas: ''
        });
        setOportunidadSeleccionada(null);
        setModoEdicion(false);
        setMostrarFormulario(true);
    };

    const handleEditarOportunidad = (oportunidad: OportunidadEmpleo) => {
        setFormData({
            empresa: oportunidad.empresa,
            puesto: oportunidad.puesto,
            descripcion: oportunidad.descripcion,
            responsabilidades: oportunidad.responsabilidades || '',
            habilidadesRequeridas: oportunidad.habilidadesRequeridas || '',
            salario: oportunidad.salario,
            beneficios: oportunidad.beneficios || '',
            ubicacion: oportunidad.ubicacion,
            fechaAplicacion: formatearFechaParaInput(oportunidad.fechaAplicacion),
            estado: oportunidad.estado,
            URLCompany: oportunidad.URLCompany || '',
            contactoNombre: oportunidad.contactoNombre || '',
            contactoEmail: oportunidad.contactoEmail || '',
            contactoTelefono: oportunidad.contactoTelefono || '',
            notas: oportunidad.notas || ''
        });
        setOportunidadSeleccionada(oportunidad);
        setModoEdicion(true);
        setMostrarFormulario(true);
    };

    const handleGuardarOportunidad = async () => {
        if (!formData.empresa || !formData.puesto) {
            alert('Por favor completa los campos obligatorios (Empresa y Puesto)');
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId) {
            alert('No se pudo obtener el ID del usuario');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (modoEdicion && oportunidadSeleccionada?.id) {
                // Actualizar oportunidad existente
                console.log('💼 Actualizando oportunidad:', oportunidadSeleccionada.id);
                const updatedOportunidad = await oportunidadesApiService.updateJobOpportunity(
                    twinId, 
                    oportunidadSeleccionada.id, 
                    formData
                );
                setOportunidades(prev => prev.map(o => o.id === oportunidadSeleccionada.id ? updatedOportunidad : o));
            } else {
                // Crear nueva oportunidad
                console.log('💼 Creando nueva oportunidad para twin:', twinId);
                const newOportunidad = await oportunidadesApiService.createJobOpportunity(twinId, formData);
                setOportunidades(prev => [...prev, newOportunidad]);
            }

            setMostrarFormulario(false);
        } catch (err) {
            console.error('Error guardando oportunidad:', err);
            setError('Error al guardar la oportunidad');
            alert('Error al guardar la oportunidad. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEliminarOportunidad = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId) {
            alert('No se pudo obtener el ID del usuario');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('💼 Eliminando oportunidad:', id);
            await oportunidadesApiService.deleteJobOpportunity(twinId, id);
            setOportunidades(prev => prev.filter(o => o.id !== id));
        } catch (err) {
            console.error('Error eliminando oportunidad:', err);
            setError('Error al eliminar la oportunidad');
            alert('Error al eliminar la oportunidad. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Loading State */}
                {loading && !mostrarFormulario && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando oportunidades...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle size={20} />
                            <span className="font-medium">Error:</span>
                            {error}
                        </div>
                        <button 
                            onClick={loadOportunidades}
                            className="mt-2 text-red-600 hover:text-red-800 underline"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {/* Content - only show when not loading or when showing form */}
                {(!loading || mostrarFormulario) && (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate("/twin-biografia")}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                                    <Target size={28} />
                                </div>
                                Oportunidades de Empleo
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Gestiona y da seguimiento a tus oportunidades laborales
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleNuevaOportunidad}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                        <Plus size={20} className="mr-2" />
                        Nueva Oportunidad
                    </Button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                                <Briefcase size={24} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            {estadisticas.total}
                        </div>
                        <div className="text-sm text-gray-600">
                            Total Oportunidades
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                                <Clock size={24} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            {estadisticas.aplicadas}
                        </div>
                        <div className="text-sm text-gray-600">
                            Aplicaciones Enviadas
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            {estadisticas.entrevistas}
                        </div>
                        <div className="text-sm text-gray-600">
                            En Proceso de Entrevista
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-green-50 text-green-600">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            {estadisticas.aceptadas}
                        </div>
                        <div className="text-sm text-gray-600">
                            Ofertas Aceptadas
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                                <Target size={24} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            {estadisticas.interesadas}
                        </div>
                        <div className="text-sm text-gray-600">
                            Posiciones de Interés
                        </div>
                    </div>
                </div>

                {/* Lista de Oportunidades */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.isArray(oportunidades) && oportunidades.map((oportunidad) => {
                        // Validar que la oportunidad tenga un estado válido
                        if (!oportunidad || !oportunidad.estado) {
                            console.warn('Oportunidad sin estado válido:', oportunidad);
                            return null;
                        }
                        
                        // Validar que tenga ID
                        if (!oportunidad.id) {
                            console.warn('⚠️ Oportunidad sin ID:', oportunidad);
                            return null;
                        }
                        
                        // Normalizar el estado para que coincida con el enum
                        const estadoNormalizado = oportunidad.estado.toLowerCase() as OportunidadEmpleo['estado'];
                        
                        const estadoInfo = estadoConfig[estadoNormalizado] || {
                            color: 'bg-gray-100 text-gray-800',
                            icon: Clock,
                            label: 'Desconocido'
                        };
                        const IconoEstado = estadoInfo.icon;

                        return (
                            <div 
                                key={oportunidad.id || `temp-${Math.random()}`}
                                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                onClick={() => {
                                    if (!oportunidad.id) {
                                        console.error('❌ ID de oportunidad es undefined');
                                        return;
                                    }
                                    console.log('🎯 Navegando a oportunidad con ID:', oportunidad.id);
                                    console.log('🎯 Tipo de ID:', typeof oportunidad.id);
                                    console.log('🎯 URL generada:', `/twin-biografia/oportunidades-empleo/${encodeURIComponent(oportunidad.id)}`);
                                    navigate(`/twin-biografia/oportunidades-empleo/${encodeURIComponent(oportunidad.id)}`);
                                }}
                            >
                                {/* Header de la tarjeta */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Building size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-800 text-lg">
                                                    {oportunidad.empresa || 'Sin empresa'}
                                                </h3>
                                                {oportunidad.URLCompany && (
                                                    <a
                                                        href={oportunidad.URLCompany}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                                        title="Visitar sitio web de la empresa"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-blue-600 font-medium">
                                                {oportunidad.puesto || 'Sin puesto'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.color} flex items-center gap-1`}>
                                        <IconoEstado size={12} />
                                        {estadoInfo.label}
                                    </span>
                                </div>

                                {/* Detalles */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <DollarSign size={16} className="text-green-600" />
                                        <span>{oportunidad.salario}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin size={16} className="text-red-600" />
                                        <span>{oportunidad.ubicacion}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar size={16} className="text-purple-600" />
                                        <span>Aplicado: {formatearFecha(oportunidad.fechaAplicacion)}</span>
                                    </div>
                                </div>

                                {/* Descripción simple */}
                                {oportunidad.descripcion && (
                                    <div className="mb-4">
                                        <p className="text-gray-600 text-sm line-clamp-3">
                                            {oportunidad.descripcion}
                                        </p>
                                    </div>
                                )}

                                {/* Contacto */}
                                {oportunidad.contactoNombre && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs font-medium text-gray-700 mb-1">Contacto:</div>
                                        <div className="text-sm text-gray-600">{oportunidad.contactoNombre}</div>
                                        {oportunidad.contactoEmail && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail size={12} />
                                                {oportunidad.contactoEmail}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Notas */}
                                {oportunidad.notas && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <div className="text-xs font-medium text-blue-700 mb-1">Notas:</div>
                                        <div className="text-sm text-blue-600">{oportunidad.notas}</div>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!oportunidad.id) {
                                                console.error('❌ ID de oportunidad es undefined en botón');
                                                return;
                                            }
                                            console.log('🔍 Navegando a oportunidad con ID:', oportunidad.id);
                                            console.log('🔍 Oportunidad completa:', oportunidad);
                                            navigate(`/twin-biografia/oportunidades-empleo/${encodeURIComponent(oportunidad.id)}`);
                                        }}
                                        className="flex-1"
                                    >
                                        <Edit size={16} className="mr-1" />
                                        Ver Detalles
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEliminarOportunidad(oportunidad.id!);
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Estado vacío */}
                {(!Array.isArray(oportunidades) || oportunidades.length === 0) && (
                    <div className="text-center py-12">
                        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Briefcase size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No hay oportunidades registradas
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Comienza agregando tu primera oportunidad de empleo
                        </p>
                        <Button onClick={handleNuevaOportunidad}>
                            <Plus size={20} className="mr-2" />
                            Agregar Primera Oportunidad
                        </Button>
                    </div>
                )}
                    </>
                )}
            </div>

            {/* Formulario Modal */}
            {mostrarFormulario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {modoEdicion ? 'Editar Oportunidad' : 'Nueva Oportunidad'}
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMostrarFormulario(false)}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información Básica */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Building size={20} className="text-blue-600" />
                                        Información Básica
                                    </h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Empresa *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.empresa}
                                            onChange={(e) => handleInputChange('empresa', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nombre de la empresa"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            URL de la Empresa
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.URLCompany}
                                            onChange={(e) => handleInputChange('URLCompany', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://www.empresa.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Puesto *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.puesto}
                                            onChange={(e) => handleInputChange('puesto', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Título del puesto"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción General
                                        </label>
                                        <textarea
                                            value={formData.descripcion}
                                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Descripción general del puesto"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Responsabilidades
                                        </label>
                                        <textarea
                                            value={formData.responsabilidades}
                                            onChange={(e) => handleInputChange('responsabilidades', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Principales responsabilidades del puesto"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Habilidades Requeridas
                                        </label>
                                        <textarea
                                            value={formData.habilidadesRequeridas}
                                            onChange={(e) => handleInputChange('habilidadesRequeridas', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Habilidades y conocimientos requeridos"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Salario
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.salario}
                                                onChange={(e) => handleInputChange('salario', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="$50,000 - $70,000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Beneficios
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.beneficios}
                                                onChange={(e) => handleInputChange('beneficios', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Seguro médico, vacaciones, etc."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ubicación
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.ubicacion}
                                                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ciudad, Estado/País"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha de Aplicación
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.fechaAplicacion}
                                                onChange={(e) => handleInputChange('fechaAplicacion', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Estado
                                            </label>
                                            <select
                                                value={formData.estado}
                                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="aplicado">Aplicado</option>
                                                <option value="entrevista">En Entrevista</option>
                                                <option value="esperando">Esperando Respuesta</option>
                                                <option value="rechazado">Rechazado</option>
                                                <option value="aceptado">Aceptado</option>
                                                <option value="interesado">Interesado</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de Contacto y Notas */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <Users size={20} className="text-purple-600" />
                                        Contacto y Notas
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre del Contacto
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.contactoNombre}
                                            onChange={(e) => handleInputChange('contactoNombre', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nombre del reclutador o contacto"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.contactoEmail}
                                            onChange={(e) => handleInputChange('contactoEmail', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="email@empresa.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.contactoTelefono}
                                            onChange={(e) => handleInputChange('contactoTelefono', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="+52 55 1234-5678"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notas Adicionales
                                        </label>
                                        <textarea
                                            value={formData.notas}
                                            onChange={(e) => handleInputChange('notas', e.target.value)}
                                            rows={6}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Notas sobre el proceso, fechas importantes, comentarios adicionales..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                                <Button
                                    onClick={handleGuardarOportunidad}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex-1"
                                >
                                    <Save size={16} className="mr-2" />
                                    {modoEdicion ? 'Actualizar' : 'Guardar'} Oportunidad
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setMostrarFormulario(false)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OportunidadesEmpleoPage;
