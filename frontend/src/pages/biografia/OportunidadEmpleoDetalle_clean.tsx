import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { oportunidadesApiService, type OportunidadEmpleo } from "@/services/oportunidadesApiService";
import { useMsal } from "@azure/msal-react";
import AIResumeRecommendation from '../../components/resume/AIResumeRecommendation';
import { 
    ArrowLeft,
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
    ExternalLink,
    Phone,
    FileText
} from "lucide-react";

function formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return fecha;
    }
}

function formatearFechaParaInput(fecha: string): string {
    if (!fecha) return '';
    try {
        const date = new Date(fecha);
        return date.toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
}

const OportunidadEmpleoDetalle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accounts } = useMsal();
    const homeAccountId = accounts[0]?.homeAccountId || '';

    const [oportunidad, setOportunidad] = useState<OportunidadEmpleo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formData, setFormData] = useState<Partial<OportunidadEmpleo>>({});

    useEffect(() => {
        cargarOportunidad();
    }, [id]);

    const cargarOportunidad = async () => {
        if (!id || !homeAccountId) return;
        
        try {
            setLoading(true);
            const data = await oportunidadesApiService.getJobOpportunity(homeAccountId, id);
            setOportunidad(data);
            setFormData(data);
        } catch (err) {
            console.error('Error al cargar oportunidad:', err);
            setError('Error al cargar la oportunidad de empleo');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof OportunidadEmpleo, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleGuardar = async () => {
        if (!oportunidad || !homeAccountId) return;

        try {
            setGuardando(true);
            const dataActualizada = { ...oportunidad, ...formData };
            await oportunidadesApiService.updateJobOpportunity(homeAccountId, oportunidad.id!, dataActualizada);
            setOportunidad(dataActualizada);
            setModoEdicion(false);
        } catch (err) {
            console.error('Error al guardar:', err);
            setError('Error al guardar los cambios');
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async () => {
        if (!oportunidad || !homeAccountId) return;
        
        if (window.confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
            try {
                await oportunidadesApiService.deleteJobOpportunity(homeAccountId, oportunidad.id!);
                navigate('/twin-biografia/oportunidades-empleo');
            } catch (err) {
                console.error('Error al eliminar:', err);
                setError('Error al eliminar la oportunidad');
            }
        }
    };

    const cancelarEdicion = () => {
        setFormData(oportunidad || {});
        setModoEdicion(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando oportunidad...</p>
                </div>
            </div>
        );
    }

    if (error || !oportunidad) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
                    <p className="text-gray-600 mb-4">{error || 'Oportunidad no encontrada'}</p>
                    <Button 
                        onClick={() => navigate('/twin-biografia/oportunidades-empleo')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver a Oportunidades
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/twin-biografia/oportunidades-empleo')}
                        className="mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Volver a Oportunidades
                    </Button>
                    
                    <h1 className="text-2xl font-bold text-gray-900">
                        {oportunidad.empresa} - {oportunidad.puesto}
                    </h1>
                </div>

                {/* Layout de dos columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna Izquierda - Editor y Información Principal */}
                    <div className="space-y-6">
                        {/* Panel de Acciones */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Edit size={20} className="text-blue-600" />
                                Acciones
                            </h2>
                            
                            <div className="flex flex-col gap-3">
                                {!modoEdicion ? (
                                    <>
                                        <Button
                                            onClick={() => setModoEdicion(true)}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <Edit size={16} />
                                            Editar Oportunidad
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleEliminar}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <Trash2 size={16} />
                                            Eliminar Oportunidad
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleGuardar}
                                            disabled={guardando}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <Save size={16} />
                                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={cancelarEdicion}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <X size={16} />
                                            Cancelar
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Formulario de Edición */}
                        {modoEdicion && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Información</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Empresa
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.empresa || ''}
                                            onChange={(e) => handleInputChange('empresa', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Puesto
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.puesto || ''}
                                            onChange={(e) => handleInputChange('puesto', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ubicación
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.ubicacion || ''}
                                                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Salario
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.salario || ''}
                                                onChange={(e) => handleInputChange('salario', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Modalidad de Empleo
                                            </label>
                                            <select
                                                value={formData.beneficios || ''}
                                                onChange={(e) => handleInputChange('beneficios', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="Tiempo Completo">Tiempo Completo</option>
                                                <option value="Tiempo Parcial">Tiempo Parcial</option>
                                                <option value="Freelance">Freelance</option>
                                                <option value="Contrato">Contrato</option>
                                                <option value="Prácticas">Prácticas</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Estado
                                            </label>
                                            <select
                                                value={formData.estado || ''}
                                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="interesado">Interesado</option>
                                                <option value="aplicado">Aplicado</option>
                                                <option value="entrevista">En Entrevista</option>
                                                <option value="esperando">Esperando</option>
                                                <option value="aceptado">Aceptado</option>
                                                <option value="rechazado">Rechazado</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha Aplicación
                                            </label>
                                            <input
                                                type="date"
                                                value={formatearFechaParaInput(formData.fechaAplicacion || '')}
                                                onChange={(e) => handleInputChange('fechaAplicacion', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notas/Fecha Límite
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.notas || ''}
                                                onChange={(e) => handleInputChange('notas', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ej: Fecha límite 15/12/2024"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL de la Empresa
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.URLCompany || ''}
                                            onChange={(e) => handleInputChange('URLCompany', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://ejemplo.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={formData.descripcion || ''}
                                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                            rows={4}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Responsabilidades
                                        </label>
                                        <textarea
                                            value={formData.responsabilidades || ''}
                                            onChange={(e) => handleInputChange('responsabilidades', e.target.value)}
                                            rows={4}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Habilidades Requeridas
                                        </label>
                                        <textarea
                                            value={formData.habilidadesRequeridas || ''}
                                            onChange={(e) => handleInputChange('habilidadesRequeridas', e.target.value)}
                                            rows={4}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email de Contacto
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.contactoEmail || ''}
                                                onChange={(e) => handleInputChange('contactoEmail', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono de Contacto
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.contactoTelefono || ''}
                                                onChange={(e) => handleInputChange('contactoTelefono', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notas Adicionales
                                        </label>
                                        <textarea
                                            value={formData.notas || ''}
                                            onChange={(e) => handleInputChange('notas', e.target.value)}
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Información de solo lectura cuando no está en modo edición */}
                        {!modoEdicion && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la Oportunidad</h3>
                                
                                {/* Información básica */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Building className="text-blue-600" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">Empresa</p>
                                            <p className="font-medium">{oportunidad.empresa}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Briefcase className="text-purple-600" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">Puesto</p>
                                            <p className="font-medium">{oportunidad.puesto}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="text-red-600" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">Ubicación</p>
                                            <p className="font-medium">{oportunidad.ubicacion}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <DollarSign className="text-green-600" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">Salario</p>
                                            <p className="font-medium">{oportunidad.salario}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Clock className="text-orange-600" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">Modalidad</p>
                                            <p className="font-medium">{oportunidad.beneficios || 'No especificado'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className={`p-2 rounded-full ${
                                            oportunidad.estado === 'aceptado' ? 'bg-green-100 text-green-700' :
                                            oportunidad.estado === 'rechazado' ? 'bg-red-100 text-red-700' :
                                            oportunidad.estado === 'aplicado' ? 'bg-blue-100 text-blue-700' :
                                            oportunidad.estado === 'entrevista' ? 'bg-purple-100 text-purple-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {oportunidad.estado === 'aceptado' ? 
                                                <CheckCircle size={16} /> : 
                                                <XCircle size={16} />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Estado</p>
                                            <p className="font-medium">{oportunidad.estado}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <Calendar className="text-blue-600" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">Fecha Aplicación</p>
                                            <p className="font-medium">{formatearFecha(oportunidad.fechaAplicacion)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <Clock className="text-orange-600" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">Información Adicional</p>
                                            <p className="font-medium">{oportunidad.notas || 'Sin información adicional'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* URL de la empresa */}
                                {oportunidad.URLCompany && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                            <ExternalLink className="text-purple-600" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-600">Sitio Web de la Empresa</p>
                                                <a 
                                                    href={oportunidad.URLCompany}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-purple-600 hover:underline"
                                                >
                                                    {oportunidad.URLCompany}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Descripción */}
                                {oportunidad.descripcion && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <FileText className="text-blue-600" size={16} />
                                            Descripción
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {oportunidad.descripcion}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Responsabilidades */}
                                {oportunidad.responsabilidades && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <Users className="text-green-600" size={16} />
                                            Responsabilidades
                                        </h4>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {oportunidad.responsabilidades}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Habilidades Requeridas */}
                                {oportunidad.habilidadesRequeridas && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <CheckCircle className="text-purple-600" size={16} />
                                            Habilidades Requeridas
                                        </h4>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {oportunidad.habilidadesRequeridas}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Información de Contacto */}
                                {(oportunidad.contactoEmail || oportunidad.contactoTelefono) && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-3">Información de Contacto</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {oportunidad.contactoEmail && (
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <Mail className="text-blue-600" size={20} />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Email</p>
                                                        <a 
                                                            href={`mailto:${oportunidad.contactoEmail}`}
                                                            className="font-medium text-blue-600 hover:underline"
                                                        >
                                                            {oportunidad.contactoEmail}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {oportunidad.contactoTelefono && (
                                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                    <Phone className="text-green-600" size={20} />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Teléfono</p>
                                                        <a 
                                                            href={`tel:${oportunidad.contactoTelefono}`}
                                                            className="font-medium text-green-600 hover:underline"
                                                        >
                                                            {oportunidad.contactoTelefono}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Notas adicionales */}
                                {oportunidad.notas && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Notas Adicionales</h4>
                                        <div className="bg-yellow-50 rounded-lg p-4">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {oportunidad.notas}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha - AI Resume Recommendation */}
                    <div className="space-y-6">
                        <AIResumeRecommendation 
                            oportunidad={oportunidad} 
                            twinId={homeAccountId} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OportunidadEmpleoDetalle;
