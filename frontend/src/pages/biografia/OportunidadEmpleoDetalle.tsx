import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { oportunidadesApiService, type OportunidadEmpleo } from "@/services/oportunidadesApiService";
import { useMsal } from "@azure/msal-react";
import AIResumeRecommendation from "@/components/ui/ai-resume-recommendation";
import { 
    ArrowLeft,
    Building,
    Edit,
    Trash2,
    Save,
    X,
    AlertCircle
} from "lucide-react";

const OportunidadEmpleoDetalle: React.FC = () => {
    const navigate = useNavigate();
    const { id: rawId } = useParams<{ id: string }>();
    const { accounts } = useMsal();
    
    // Decodificar el ID una sola vez
    const id = rawId ? decodeURIComponent(rawId) : null;
    
    const [oportunidad, setOportunidad] = useState<OportunidadEmpleo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    const getCurrentTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
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

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        const cargarOportunidad = async () => {
            console.log('🔍 Raw ID desde useParams:', rawId);
            console.log('🔍 ID decodificado:', id);
            console.log('🔍 Tipo de ID:', typeof id);
            
            if (!id) {
                console.error('❌ ID de oportunidad es null/undefined');
                setError('ID de oportunidad no válido');
                setLoading(false);
                return;
            }

            const twinId = getCurrentTwinId();
            console.log('🔍 TwinID obtenido en detalles:', twinId);
            
            if (!twinId) {
                setError('No se pudo obtener el ID del usuario');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Cargar todas las oportunidades y buscar la específica
                const response = await oportunidadesApiService.getJobOpportunities(twinId);
                console.log('📋 Response de oportunidades:', response);
                
                // Extraer las oportunidades del response
                let oportunidades = [];
                if (Array.isArray(response)) {
                    oportunidades = response;
                } else if (response && response.Opportunities && Array.isArray(response.Opportunities)) {
                    oportunidades = response.Opportunities;
                } else {
                    console.error('❌ Response no es un array válido:', response);
                    setError('Error al cargar las oportunidades');
                    return;
                }
                
                console.log('🔍 Buscando oportunidad con ID:', id);
                console.log('📋 Oportunidades disponibles:', oportunidades.map(o => ({ id: o.id, empresa: o.empresa })));
                
                // Buscar por ID exacto y también por conversión a string
                const oportunidadEncontrada = oportunidades.find(o => 
                    o.id === id || 
                    String(o.id) === String(id) ||
                    o.id === String(id) ||
                    String(o.id) === id
                );
                
                if (!oportunidadEncontrada) {
                    console.error('❌ Oportunidad no encontrada. ID buscado:', id);
                    console.error('❌ IDs disponibles:', oportunidades.map(o => o.id));
                    console.error('❌ Tipos de IDs:', oportunidades.map(o => ({ id: o.id, tipo: typeof o.id })));
                    setError('Oportunidad no encontrada');
                    return;
                }

                setOportunidad(oportunidadEncontrada);
                setFormData({
                    empresa: oportunidadEncontrada.empresa,
                    puesto: oportunidadEncontrada.puesto,
                    descripcion: oportunidadEncontrada.descripcion,
                    responsabilidades: oportunidadEncontrada.responsabilidades || '',
                    habilidadesRequeridas: oportunidadEncontrada.habilidadesRequeridas || '',
                    salario: oportunidadEncontrada.salario,
                    beneficios: oportunidadEncontrada.beneficios || '',
                    ubicacion: oportunidadEncontrada.ubicacion,
                    fechaAplicacion: formatearFechaParaInput(oportunidadEncontrada.fechaAplicacion),
                    estado: oportunidadEncontrada.estado,
                    URLCompany: oportunidadEncontrada.URLCompany || '',
                    contactoNombre: oportunidadEncontrada.contactoNombre || '',
                    contactoEmail: oportunidadEncontrada.contactoEmail || '',
                    contactoTelefono: oportunidadEncontrada.contactoTelefono || '',
                    notas: oportunidadEncontrada.notas || ''
                });
            } catch (error) {
                console.error('Error al cargar la oportunidad:', error);
                setError('Error al cargar la oportunidad');
            } finally {
                setLoading(false);
            }
        };

        cargarOportunidad();
    }, [id]);

    const handleGuardar = async () => {
        if (!formData.empresa || !formData.puesto) {
            alert('Por favor completa los campos obligatorios (Empresa y Puesto)');
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId || !id) {
            alert('Error al obtener datos necesarios');
            return;
        }

        try {
            setLoading(true);
            const updatedOportunidad = await oportunidadesApiService.updateJobOpportunity(twinId, id, formData);
            setOportunidad(updatedOportunidad);
            setModoEdicion(false);
            alert('Oportunidad actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Error al actualizar la oportunidad');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta oportunidad?')) {
            return;
        }

        const twinId = getCurrentTwinId();
        if (!twinId || !id) {
            alert('Error al obtener datos necesarios');
            return;
        }

        try {
            setLoading(true);
            await oportunidadesApiService.deleteJobOpportunity(twinId, id);
            alert('Oportunidad eliminada exitosamente');
            navigate('/twin-biografia/oportunidades-empleo');
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar la oportunidad');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando oportunidad...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !oportunidad) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button onClick={() => navigate('/twin-biografia/oportunidades-empleo')}>
                                Volver a Oportunidades
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/twin-biografia/oportunidades-empleo')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Volver a Oportunidades
                    </Button>
                    
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building size={24} className="text-blue-600" />
                        {oportunidad.empresa} - {oportunidad.puesto}
                    </h1>
                </div>

                {/* Layout de dos columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna Izquierda - Editor y Acciones */}
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
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <Save size={16} />
                                            Guardar Cambios
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setModoEdicion(false)}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            <X size={16} />
                                            Cancelar Edición
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Panel de Edición - Solo se muestra cuando está en modo edición */}
                        {modoEdicion && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Edit size={20} className="text-blue-600" />
                                    Editor de Oportunidad
                                </h2>
                                
                                {/* Formulario de edición compacto */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Empresa *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.empresa}
                                                onChange={(e) => handleInputChange('empresa', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Nombre de la empresa"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                URL de la Empresa
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.URLCompany}
                                                onChange={(e) => handleInputChange('URLCompany', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="https://www.empresa.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Puesto *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.puesto}
                                                onChange={(e) => handleInputChange('puesto', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Título del puesto"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Estado
                                            </label>
                                            <select
                                                value={formData.estado}
                                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            >
                                                <option value="aplicado">Aplicado</option>
                                                <option value="entrevista">En Entrevista</option>
                                                <option value="esperando">Esperando Respuesta</option>
                                                <option value="rechazado">Rechazado</option>
                                                <option value="aceptado">Aceptado</option>
                                                <option value="interesado">Interesado</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Salario
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.salario}
                                                onChange={(e) => handleInputChange('salario', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Ej: $50,000 - $60,000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ubicación
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.ubicacion}
                                                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Ciudad, País"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha de Aplicación
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.fechaAplicacion}
                                                onChange={(e) => handleInputChange('fechaAplicacion', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contacto
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.contactoNombre}
                                                onChange={(e) => handleInputChange('contactoNombre', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Nombre del contacto"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email del Contacto
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.contactoEmail}
                                                onChange={(e) => handleInputChange('contactoEmail', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="contacto@empresa.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono del Contacto
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.contactoTelefono}
                                                onChange={(e) => handleInputChange('contactoTelefono', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción del Puesto
                                            </label>
                                            <textarea
                                                value={formData.descripcion}
                                                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Descripción detallada del puesto..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Responsabilidades
                                            </label>
                                            <textarea
                                                value={formData.responsabilidades}
                                                onChange={(e) => handleInputChange('responsabilidades', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Principales responsabilidades del puesto..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Habilidades Requeridas
                                            </label>
                                            <textarea
                                                value={formData.habilidadesRequeridas}
                                                onChange={(e) => handleInputChange('habilidadesRequeridas', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Habilidades técnicas y blandas requeridas..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Beneficios
                                            </label>
                                            <textarea
                                                value={formData.beneficios}
                                                onChange={(e) => handleInputChange('beneficios', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Beneficios ofrecidos por la empresa..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notas Adicionales
                                            </label>
                                            <textarea
                                                value={formData.notas}
                                                onChange={(e) => handleInputChange('notas', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                placeholder="Cualquier información adicional relevante..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Columna Derecha - AI Resume Recommendation */}
                    <div className="space-y-6">
                        <AIResumeRecommendation
                            jobDescription={oportunidad.descripcion || ''}
                            jobTitle={oportunidad.puesto}
                            company={oportunidad.empresa}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OportunidadEmpleoDetalle;
