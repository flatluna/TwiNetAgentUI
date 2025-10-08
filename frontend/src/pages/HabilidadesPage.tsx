import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Search,
  Star,
  TrendingUp,
  Award,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Loader2,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import SkillModal from '@/components/SkillModal';
import AIEnhancementModal from '@/components/AIEnhancementModal';
import { SkillData, useSkillsApi } from '@/services/skillsApiService';

const skillCategories = [
  'Tecnología',
  'Construcción',
  'Contabilidad & Finanzas',
  'Legal',
  'Medicina & Salud',
  'Educación',
  'Arte & Diseño',
  'Ventas & Marketing',
  'Idiomas',
  'Oficios',
  'Gestión & Liderazgo',
  'Otros'
];

const skillLevels = [
  { value: 'Principiante', color: 'bg-red-100 text-red-800', stars: 1 },
  { value: 'Intermedio', color: 'bg-yellow-100 text-yellow-800', stars: 2 },
  { value: 'Avanzado', color: 'bg-blue-100 text-blue-800', stars: 3 },
  { value: 'Experto', color: 'bg-green-100 text-green-800', stars: 4 }
];

const HabilidadesPage: React.FC = () => {
  const navigate = useNavigate();
  const { skills, loading, error, loadSkills, createSkill, updateSkill, deleteSkill } = useSkillsApi();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Cargar habilidades cuando el componente se monta
    loadSkills();
  }, [loadSkills]); // Only depend on loadSkills

  // Filtrar habilidades - asegurar que skills sea un array y validar propiedades
  const filteredSkills = Array.isArray(skills) ? skills.filter(skill => {
    // Validar que skill y sus propiedades existan
    if (!skill || typeof skill !== 'object') return false;
    
    const skillName = skill.name || '';
    const skillDescription = skill.description || '';
    const skillTags = Array.isArray(skill.tags) ? skill.tags : [];
    const skillCategory = skill.category || '';
    const skillLevel = skill.level || '';
    
    const matchesSearch = skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skillDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skillTags.some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || skillCategory === selectedCategory;
    const matchesLevel = !selectedLevel || skillLevel === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  }) : [];

  // Estadísticas - asegurar que skills sea un array y validar propiedades
  const skillsArray = Array.isArray(skills) ? skills.filter(skill => skill && typeof skill === 'object') : [];
  const totalSkills = skillsArray.length;
  const skillsByLevel = skillsArray.reduce((acc, skill) => {
    const level = skill.level || 'Desconocido';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const expertSkills = skillsByLevel['Experto'] || 0;
  const validatedSkills = skillsArray.filter(skill => skill.validated === true).length;

  // Funciones de manejo
  const handleAddSkill = () => {
    setEditingSkill(null);
    setShowModal(true);
  };

  const handleEditSkill = (skill: SkillData) => {
    setEditingSkill(skill);
    setShowModal(true);
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta habilidad?')) {
      try {
        await deleteSkill(skillId);
      } catch (error) {
        console.error('Error deleting skill:', error);
        // Aquí podrías mostrar una notificación de error
      }
    }
  };

  const handleSaveSkill = async (skillData: Omit<SkillData, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    try {
      if (editingSkill && editingSkill.id) {
        // Actualizar habilidad existente
        await updateSkill(editingSkill.id, skillData);
        // Mostrar mensaje de éxito por 3 segundos
        setSuccessMessage(`Habilidad "${skillData.name}" actualizada exitosamente`);
        setTimeout(() => setSuccessMessage(''), 3000);
        // NO actualizar editingSkill para evitar resetear el formulario
        // El modal manejará internamente el mensaje de éxito
      } else {
        // Crear nueva habilidad
        await createSkill(skillData);
        setSuccessMessage(`Habilidad "${skillData.name}" creada exitosamente`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      // Los errores se manejan dentro del modal
    }
  };

  const handleEnhanceSkills = async (selectedSkills: string[]) => {
    try {
      // Aquí podrías implementar la mejora con IA
      console.log('Enhancing skills:', selectedSkills);
      setShowAIModal(false);
    } catch (error) {
      console.error('Error enhancing skills:', error);
    }
  };

  const getStarRating = (level: string) => {
    const levelData = skillLevels.find(l => l.value === level);
    return levelData ? levelData.stars : 1;
  };

  const getLevelColor = (level: string) => {
    const levelData = skillLevels.find(l => l.value === level);
    return levelData ? levelData.color : 'bg-gray-100 text-gray-800';
  };

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Cargando habilidades...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar habilidades</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadSkills}>
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                Mis Habilidades Profesionales
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona y potencia tus habilidades con inteligencia artificial
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAIModal(true)}
              variant="outline"
              className="bg-white hover:bg-purple-50 border-purple-200"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              Potenciar con IA
            </Button>
            <Button onClick={handleAddSkill} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Habilidad
            </Button>
          </div>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-6">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Habilidades</p>
                  <p className="text-3xl font-bold text-gray-900">{totalSkills}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nivel Experto</p>
                  <p className="text-3xl font-bold text-green-600">{expertSkills}</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validadas</p>
                  <p className="text-3xl font-bold text-purple-600">{validatedSkills}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Crecimiento</p>
                  <p className="text-3xl font-bold text-orange-600">+15%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 bg-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar habilidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Todas las categorías</option>
                {skillCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>

              <Select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
                <option value="">Todos los niveles</option>
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.value}</option>
                ))}
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedLevel('');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Habilidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              <Card key={skill.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02] relative overflow-hidden">
                {/* Badge de nivel flotante */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className={`${getLevelColor(skill.level)} shadow-sm`}>
                    {skill.level}
                  </Badge>
                </div>

                {/* Indicador de validación */}
                {skill.validated && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-green-100 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                )}

                <CardHeader className="pb-4 pt-6">
                  <div className="space-y-3">
                    {/* Título y estrellas */}
                    <div className="pr-16"> {/* Espacio para el badge */}
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {skill.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: getStarRating(skill.level) }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        {Array.from({ length: 4 - getStarRating(skill.level) }).map((_, i) => (
                          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
                        ))}
                      </div>
                    </div>

                    {/* Botones de acción flotantes */}
                    <div className="absolute top-6 right-16 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSkill(skill)}
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                      >
                        <Edit3 className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => skill.id && handleDeleteSkill(skill.id)}
                        className="h-8 w-8 p-0 bg-white/80 hover:bg-red-50 shadow-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-6">
                  {/* Descripción */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                  
                  {/* Estadísticas con iconos mejorados */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-2">
                      <div className="bg-blue-100 rounded-full p-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-blue-600 font-medium">{skill.experienceYears}</div>
                        <div className="text-xs text-gray-500">años</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-2">
                      <div className="bg-purple-100 rounded-full p-1">
                        <Award className="w-3 h-3 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-purple-600 font-medium">{(skill.certifications || []).length}</div>
                        <div className="text-xs text-gray-500">certificaciones</div>
                      </div>
                    </div>
                  </div>

                  {/* Tags mejorados */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(skill.tags || []).slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                    {(skill.tags || []).length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        +{(skill.tags || []).length - 3} más
                      </Badge>
                    )}
                  </div>

                  {/* Botones de acción principales */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/mi-conocimiento/habilidades/nuevo-aprendi/${skill.id}`, {
                          state: { skill: skill }
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo aprendi
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 transition-all font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Conocimiento + para: ${skill.name}`);
                        console.log('Conocimiento + clicked for skill:', skill.name);
                      }}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Conocimiento +
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full bg-white border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron habilidades</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory || selectedLevel
                    ? 'Ajusta los filtros o agrega tu primera habilidad'
                    : 'Comienza agregando tus habilidades profesionales'
                  }
                </p>
                <Button onClick={handleAddSkill}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Habilidad
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal para Agregar/Editar Habilidad */}
        <SkillModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingSkill(null);
          }}
          onSave={handleSaveSkill}
          skill={editingSkill}
          categories={skillCategories}
        />

        {/* Modal de Potenciamiento con IA */}
        <AIEnhancementModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          skills={skills}
          onEnhanceSkills={handleEnhanceSkills}
        />
      </div>
    </div>
  );
};

export default HabilidadesPage;