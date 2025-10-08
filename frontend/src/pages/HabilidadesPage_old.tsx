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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import SkillModal from '@/components/SkillModal';
import AIEnhancementModal from '@/components/AIEnhancementModal';
import { skillsApiService, SkillData, useSkillsApi } from '@/services/skillsApiService';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  description: string;
  experienceYears: number;
  certifications: string[];
  projects: string[];
  learningPath: string[];
  aiSuggestions: string[];
  tags: string[];
  dateAdded: string;
  lastUpdated: string;
  validated: boolean;
}

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
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);


  // Datos de ejemplo
  useEffect(() => {
    const exampleSkills: Skill[] = [
      {
        id: '1',
        name: 'Plomería Residencial',
        category: 'Construcción',
        level: 'Experto',
        description: 'Instalación, reparación y mantenimiento de sistemas de plomería en viviendas',
        experienceYears: 15,
        certifications: ['Certificación Nacional de Plomería', 'Instalador de Gas Autorizado'],
        projects: ['Remodelación Casa Familiar', 'Instalación Sistema Solar Térmico'],
        learningPath: ['Fontanería Básica', 'Sistemas de Calefacción', 'Energías Renovables'],
        aiSuggestions: [
          'Considera especializarte en sistemas inteligentes IoT para el hogar',
          'La domótica en plomería está en crecimiento',
          'Cursos de eficiencia energética pueden ampliar tu perfil'
        ],
        tags: ['plomería', 'instalación', 'reparación', 'gas', 'agua'],
        dateAdded: '2024-01-15',
        lastUpdated: '2024-09-20',
        validated: true
      },
      {
        id: '2',
        name: 'Contabilidad Fiscal',
        category: 'Contabilidad & Finanzas',
        level: 'Avanzado',
        description: 'Preparación de declaraciones fiscales y asesoramiento tributario',
        experienceYears: 8,
        certifications: ['CPA', 'Especialista en Impuestos'],
        projects: ['Asesoría Fiscal PYME', 'Implementación Software Contable'],
        learningPath: ['Contabilidad General', 'Tributación', 'Auditoría'],
        aiSuggestions: [
          'La automatización contable con IA está transformando el sector',
          'Especialización en criptomonedas y activos digitales',
          'Sostenibilidad financiera es una tendencia creciente'
        ],
        tags: ['contabilidad', 'impuestos', 'fiscal', 'finanzas'],
        dateAdded: '2024-02-10',
        lastUpdated: '2024-09-15',
        validated: true
      }
    ];
    setSkills(exampleSkills);
  }, []);

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    const matchesLevel = !selectedLevel || skill.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getStarRating = (level: string) => {
    const levelData = skillLevels.find(l => l.value === level);
    return levelData ? levelData.stars : 1;
  };

  const handleAddSkill = () => {
    setEditingSkill(null);
    setShowModal(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setShowModal(true);
  };

  const handleSaveSkill = (skill: Skill) => {
    if (editingSkill) {
      // Editar habilidad existente
      setSkills(prev => prev.map(s => s.id === skill.id ? skill : s));
    } else {
      // Agregar nueva habilidad
      setSkills(prev => [...prev, skill]);
    }
    setShowModal(false);
    setEditingSkill(null);
  };

  const handleDeleteSkill = (skillId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta habilidad?')) {
      setSkills(prev => prev.filter(s => s.id !== skillId));
    }
  };

  const handleAIEnhancement = () => {
    setShowAIModal(true);
  };

  const handleEnhanceSkills = (enhancedSkills: Skill[]) => {
    setSkills(enhancedSkills);
    setShowAIModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/mi-conocimiento')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mis Habilidades</h1>
                  <p className="text-gray-600">Gestiona y potencia tu conocimiento profesional</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleAIEnhancement}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Potenciar con IA</span>
              </Button>
              <Button
                onClick={handleAddSkill}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Habilidad</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Habilidades</p>
                  <p className="text-3xl font-bold text-blue-700">{skills.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Nivel Experto</p>
                  <p className="text-3xl font-bold text-green-700">
                    {skills.filter(s => s.level === 'Experto').length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Certificaciones</p>
                  <p className="text-3xl font-bold text-yellow-700">
                    {skills.reduce((total, skill) => total + skill.certifications.length, 0)}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Años Experiencia</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {skills.reduce((total, skill) => total + skill.experienceYears, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar habilidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full"
              >
                <option value="">Todas las categorías</option>
                {skillCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              <Select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full"
              >
                <option value="">Todos los niveles</option>
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.value}</option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Habilidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSkills.map((skill) => {
            const levelData = skillLevels.find(l => l.value === skill.level);
            return (
              <Card key={skill.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl text-gray-900">{skill.name}</CardTitle>
                        {skill.validated && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                      <Badge className={levelData?.color}>
                        <div className="flex items-center space-x-1">
                          <span>{skill.level}</span>
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < getStarRating(skill.level) ? 'fill-current' : ''}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditSkill(skill)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSkill(skill.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{skill.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{skill.experienceYears} años de experiencia</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Award className="w-4 h-4" />
                      <span>{skill.certifications.length} certificaciones</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {skill.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{skill.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {skill.aiSuggestions.length > 0 && (
                      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Sugerencias IA</span>
                        </div>
                        <p className="text-xs text-purple-700">{skill.aiSuggestions[0]}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron habilidades</h3>
              <p className="text-gray-500 mb-6">Ajusta los filtros o agrega tu primera habilidad</p>
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
  );
};

export default HabilidadesPage;