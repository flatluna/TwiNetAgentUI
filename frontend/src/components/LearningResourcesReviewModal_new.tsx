import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Play, 
  Globe, 
  Award, 
  Users, 
  Tool, 
  Route, 
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock,
  Star,
  GraduationCap,
  Video,
  MapPin,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Calendar,
  DollarSign,
  Languages,
  Heart,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Interfaces para la nueva estructura de datos más completa
interface LearningResource {
  topicoAprendizaje: string;
  cursosOnline: Array<{
    titulo: string;
    instructor: string;
    plataforma: string;
    url: string;
    precio: string;
    duracion: string;
    nivel: string;
    idioma: string;
    certificacion: string;
    descripcion: string;
  }>;
  librosRecomendados: Array<{
    titulo: string;
    autor: string;
    url: string;
    precio: string;
    formato: string;
    año: string;
    descripcion: string;
  }>;
  videosTutoriales: Array<{
    titulo: string;
    canal: string;
    url: string;
    duracion: string;
    nivel: string;
    descripcion: string;
  }>;
  sitiosEducativos: Array<{
    nombre: string;
    url: string;
    tipo: string;
    acceso: string;
    descripcion: string;
  }>;
  herramientasPractica: Array<{
    nombre: string;
    url: string;
    tipo: string;
    acceso: string;
    descripcion: string;
  }>;
  certificaciones: Array<{
    nombre: string;
    organizacion: string;
    url: string;
    costo: string;
    validez: string;
    requisitos: string;
  }>;
  comunidades: Array<{
    nombre: string;
    plataforma: string;
    url: string;
    miembros: string;
    descripcion: string;
  }>;
  rutaAprendizaje: Array<{
    paso: number;
    titulo: string;
    recursos: string[];
    tiempoEstimado: string;
  }>;
  palabrasClave: string[];
  resumenGeneral: string;
  htmlCompleto: string;
}

interface LearningResourcesReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (resources: LearningResource) => void;
  resources: LearningResource | null;
  isLoading: boolean;
  isViewOnly?: boolean;
}

// Componente de sección colapsible moderna
const ModernCollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  count?: number;
  bgColor?: string;
  iconColor?: string;
}> = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false,
  count,
  bgColor = "bg-gray-50",
  iconColor = "text-blue-600"
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-5 ${bgColor} hover:bg-opacity-80 transition-all duration-200`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm ${iconColor}`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
            {count !== undefined && (
              <p className="text-sm text-gray-600">{count} recursos disponibles</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <Badge variant="secondary" className="bg-white/80 text-gray-700">
              {count}
            </Badge>
          )}
          <div className={`p-1 rounded ${iconColor}`}>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-5 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

// Componente de tarjeta de recurso profesional
const ProfessionalResourceCard: React.FC<{
  title: string;
  description: string;
  url?: string;
  metadata: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  linkText?: string;
  gradientColors?: string;
  actionIcon?: React.ReactNode;
}> = ({ 
  title, 
  description, 
  url, 
  metadata, 
  linkText = "Explorar recurso",
  gradientColors = "from-blue-500 to-purple-600",
  actionIcon = <ExternalLink className="w-4 h-4" />
}) => (
  <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
          {title}
        </h4>
        <p className="text-gray-600 leading-relaxed text-sm mb-4">
          {description}
        </p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {metadata.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          {item.icon && <div className="text-gray-400">{item.icon}</div>}
          <span className="font-medium text-gray-700">{item.label}:</span>
          <span className="text-gray-600">{item.value}</span>
        </div>
      ))}
    </div>
    
    {url && url !== 'Varía según región' && (
      <div className="flex justify-end">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${gradientColors} text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
        >
          {linkText} {actionIcon}
        </a>
      </div>
    )}
  </div>
);

// Componente principal del modal
const LearningResourcesReviewModal: React.FC<LearningResourcesReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  resources,
  isLoading,
  isViewOnly = false
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (resources) {
      onConfirm(resources);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Moderno con Gradiente */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white p-8">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {isViewOnly ? 'Explorar Recursos Guardados' : 'Recursos Personalizados por IA'}
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    {isViewOnly ? 'Revisa tus recursos de aprendizaje inteligente' : 'Plan de aprendizaje optimizado para tu perfil'}
                  </p>
                </div>
              </div>
              
              {resources && (
                <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <h3 className="font-semibold text-lg mb-2">🎯 Enfoque Principal</h3>
                  <p className="text-indigo-100 leading-relaxed">
                    {resources.topicoAprendizaje || 'Tema no especificado'}
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
                <div className="absolute inset-0 rounded-full border-4 border-gray-100 animate-pulse"></div>
              </div>
              <div className="text-center mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🧠 Generando recursos inteligentes...
                </h3>
                <p className="text-gray-600 max-w-md">
                  Nuestra IA está analizando tu perfil y creando un plan de aprendizaje completamente personalizado. 
                  Esto puede tomar unos momentos.
                </p>
              </div>
            </div>
          ) : resources ? (
            <div className="p-8 space-y-8">
              {/* Ruta de Aprendizaje - Sección Destacada */}
              {resources.rutaAprendizaje && resources.rutaAprendizaje.length > 0 && (
                <ModernCollapsibleSection
                  title="🗺️ Ruta de Aprendizaje Personalizada"
                  icon={<Route className="w-6 h-6" />}
                  defaultExpanded={true}
                  count={resources.rutaAprendizaje.length}
                  bgColor="bg-gradient-to-r from-green-50 to-emerald-50"
                  iconColor="text-green-600"
                >
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        🎯 Tu Plan de Aprendizaje Paso a Paso
                      </h4>
                      <p className="text-gray-600">
                        Sigue esta ruta estructurada para maximizar tu progreso
                      </p>
                    </div>
                    
                    <div className="relative">
                      {resources.rutaAprendizaje.map((paso, index) => (
                        <div key={index} className="relative flex items-start pb-8">
                          {/* Línea conectora */}
                          {index < resources.rutaAprendizaje.length - 1 && (
                            <div className="absolute left-6 top-14 w-0.5 h-16 bg-gradient-to-b from-green-400 to-green-200"></div>
                          )}
                          
                          {/* Número del paso */}
                          <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                            {paso.paso}
                          </div>
                          
                          {/* Contenido del paso */}
                          <div className="ml-6 flex-1 bg-white border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h5 className="font-semibold text-gray-900 text-lg mb-3">
                              {paso.titulo}
                            </h5>
                            
                            <div className="flex items-center gap-2 mb-4">
                              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                {paso.tiempoEstimado}
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="font-medium text-gray-800 mb-2">📋 Recursos incluidos:</h6>
                              <ul className="space-y-2">
                                {paso.recursos?.map((recurso, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <span>{recurso}</span>
                                  </li>
                                )) || []}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Cursos Online */}
              {resources.cursosOnline && resources.cursosOnline.length > 0 && (
                <ModernCollapsibleSection
                  title="🎓 Cursos Online Especializados"
                  icon={<GraduationCap className="w-6 h-6" />}
                  count={resources.cursosOnline.length}
                  bgColor="bg-gradient-to-r from-blue-50 to-cyan-50"
                  iconColor="text-blue-600"
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {resources.cursosOnline.map((curso, index) => (
                      <ProfessionalResourceCard
                        key={index}
                        title={curso.titulo}
                        description={curso.descripcion}
                        url={curso.url}
                        metadata={[
                          { label: "Instructor", value: curso.instructor, icon: <Users className="w-4 h-4" /> },
                          { label: "Plataforma", value: curso.plataforma, icon: <Globe className="w-4 h-4" /> },
                          { label: "Duración", value: curso.duracion, icon: <Clock className="w-4 h-4" /> },
                          { label: "Nivel", value: curso.nivel, icon: <TrendingUp className="w-4 h-4" /> },
                          { label: "Precio", value: curso.precio, icon: <DollarSign className="w-4 h-4" /> },
                          { label: "Idioma", value: curso.idioma, icon: <Languages className="w-4 h-4" /> }
                        ]}
                        linkText="Acceder al curso"
                        gradientColors="from-blue-500 to-cyan-600"
                      />
                    ))}
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Libros Recomendados */}
              {resources.librosRecomendados && resources.librosRecomendados.length > 0 && (
                <ModernCollapsibleSection
                  title="📚 Biblioteca Curada"
                  icon={<BookOpen className="w-6 h-6" />}
                  count={resources.librosRecomendados.length}
                  bgColor="bg-gradient-to-r from-purple-50 to-pink-50"
                  iconColor="text-purple-600"
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {resources.librosRecomendados.map((libro, index) => (
                      <ProfessionalResourceCard
                        key={index}
                        title={libro.titulo}
                        description={libro.descripcion}
                        url={libro.url}
                        metadata={[
                          { label: "Autor", value: libro.autor, icon: <Users className="w-4 h-4" /> },
                          { label: "Año", value: libro.año, icon: <Calendar className="w-4 h-4" /> },
                          { label: "Formato", value: libro.formato, icon: <Bookmark className="w-4 h-4" /> },
                          { label: "Precio", value: libro.precio, icon: <DollarSign className="w-4 h-4" /> }
                        ]}
                        linkText="Ver libro"
                        gradientColors="from-purple-500 to-pink-600"
                        actionIcon={<BookOpen className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Videos Tutoriales */}
              {resources.videosTutoriales && resources.videosTutoriales.length > 0 && (
                <ModernCollapsibleSection
                  title="🎬 Videos y Tutoriales"
                  icon={<Video className="w-6 h-6" />}
                  count={resources.videosTutoriales.length}
                  bgColor="bg-gradient-to-r from-red-50 to-orange-50"
                  iconColor="text-red-600"
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {resources.videosTutoriales.map((video, index) => (
                      <ProfessionalResourceCard
                        key={index}
                        title={video.titulo}
                        description={video.descripcion}
                        url={video.url}
                        metadata={[
                          { label: "Canal", value: video.canal, icon: <Play className="w-4 h-4" /> },
                          { label: "Duración", value: video.duracion, icon: <Clock className="w-4 h-4" /> },
                          { label: "Nivel", value: video.nivel, icon: <Target className="w-4 h-4" /> }
                        ]}
                        linkText="Ver video"
                        gradientColors="from-red-500 to-orange-600"
                        actionIcon={<Play className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Sitios Educativos */}
              {resources.sitiosEducativos && resources.sitiosEducativos.length > 0 && (
                <ModernCollapsibleSection
                  title="🌐 Recursos Web Especializados"
                  icon={<Globe className="w-6 h-6" />}
                  count={resources.sitiosEducativos.length}
                  bgColor="bg-gradient-to-r from-teal-50 to-cyan-50"
                  iconColor="text-teal-600"
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {resources.sitiosEducativos.map((sitio, index) => (
                      <ProfessionalResourceCard
                        key={index}
                        title={sitio.nombre}
                        description={sitio.descripcion}
                        url={sitio.url}
                        metadata={[
                          { label: "Tipo", value: sitio.tipo, icon: <Tag className="w-4 h-4" /> },
                          { label: "Acceso", value: sitio.acceso, icon: <Shield className="w-4 h-4" /> }
                        ]}
                        linkText="Explorar sitio"
                        gradientColors="from-teal-500 to-cyan-600"
                        actionIcon={<Globe className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Herramientas de Práctica */}
              {resources.herramientasPractica && resources.herramientasPractica.length > 0 && (
                <ModernCollapsibleSection
                  title="🛠️ Herramientas y Software"
                  icon={<Tool className="w-6 h-6" />}
                  count={resources.herramientasPractica.length}
                  bgColor="bg-gradient-to-r from-orange-50 to-amber-50"
                  iconColor="text-orange-600"
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {resources.herramientasPractica.map((herramienta, index) => (
                      <ProfessionalResourceCard
                        key={index}
                        title={herramienta.nombre}
                        description={herramienta.descripcion}
                        url={herramienta.url}
                        metadata={[
                          { label: "Tipo", value: herramienta.tipo, icon: <Tool className="w-4 h-4" /> },
                          { label: "Acceso", value: herramienta.acceso, icon: <Shield className="w-4 h-4" /> }
                        ]}
                        linkText="Usar herramienta"
                        gradientColors="from-orange-500 to-amber-600"
                        actionIcon={<Tool className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Certificaciones */}
              {resources.certificaciones && resources.certificaciones.length > 0 && (
                <ModernCollapsibleSection
                  title="🏆 Certificaciones Profesionales"
                  icon={<Award className="w-6 h-6" />}
                  count={resources.certificaciones.length}
                  bgColor="bg-gradient-to-r from-yellow-50 to-amber-50"
                  iconColor="text-yellow-600"
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {resources.certificaciones.map((cert, index) => (
                      <ProfessionalResourceCard
                        key={index}
                        title={cert.nombre}
                        description={cert.requisitos}
                        url={cert.url}
                        metadata={[
                          { label: "Organización", value: cert.organizacion, icon: <Award className="w-4 h-4" /> },
                          { label: "Costo", value: cert.costo, icon: <DollarSign className="w-4 h-4" /> },
                          { label: "Validez", value: cert.validez, icon: <Calendar className="w-4 h-4" /> }
                        ]}
                        linkText="Ver certificación"
                        gradientColors="from-yellow-500 to-amber-600"
                        actionIcon={<Award className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Comunidades */}
              {resources.comunidades && resources.comunidades.length > 0 && (
                <ModernCollapsibleSection
                  title="👥 Comunidades de Expertos"
                  icon={<Users className="w-6 h-6" />}
                  count={resources.comunidades.length}
                  bgColor="bg-gradient-to-r from-indigo-50 to-purple-50"
                  iconColor="text-indigo-600"
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {resources.comunidades.map((comunidad, index) => (
                      <ProfessionalResourceCard
                        key={index}
                        title={comunidad.nombre}
                        description={comunidad.descripcion}
                        url={comunidad.url}
                        metadata={[
                          { label: "Plataforma", value: comunidad.plataforma, icon: <Globe className="w-4 h-4" /> },
                          { label: "Miembros", value: comunidad.miembros, icon: <Users className="w-4 h-4" /> }
                        ]}
                        linkText="Unirse"
                        gradientColors="from-indigo-500 to-purple-600"
                        actionIcon={<Users className="w-4 h-4" />}
                      />
                    ))}
                  </div>
                </ModernCollapsibleSection>
              )}

              {/* Información Adicional */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Palabras Clave */}
                {resources.palabrasClave && resources.palabrasClave.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Tag className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">🏷️ Palabras Clave</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resources.palabrasClave.map((palabra, index) => (
                        <span key={index} className="bg-white text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                          #{palabra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen General */}
                {resources.resumenGeneral && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">📋 Análisis Inteligente</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{resources.resumenGeneral}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sin recursos disponibles
                </h3>
                <p className="text-gray-600 max-w-md">
                  No se encontraron recursos de aprendizaje. Genera nuevos recursos con IA para comenzar tu plan personalizado.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Acciones */}
        {!isLoading && resources && (
          <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-1 font-medium">
                  {isViewOnly ? 
                    '✨ Recursos optimizados por IA para acelerar tu aprendizaje profesional' : 
                    '🚀 Plan personalizado listo para integrar con tu contenido existente'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  La integración preservará tu contenido actual y agregará estos recursos de forma inteligente
                </p>
              </div>
              
              <div className="flex gap-3 w-full lg:w-auto">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 lg:flex-initial px-6 py-2 border-gray-300 hover:bg-gray-50 font-medium"
                >
                  {isViewOnly ? 'Cerrar' : 'Cancelar'}
                </Button>
                
                {!isViewOnly && (
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 lg:flex-initial px-8 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Integrar Recursos IA
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningResourcesReviewModal;