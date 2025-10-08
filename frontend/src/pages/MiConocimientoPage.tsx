import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Book, 
  GraduationCap, 
  Target, 
  BookOpen,
  Plus,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MiConocimientoPage: React.FC = () => {
  const navigate = useNavigate();

  // Datos de ejemplo - en el futuro vendrán del backend
  const knowledgeTypes = [
    {
      id: 'libros',
      title: 'Libros',
      description: 'Tu biblioteca personal con notas y reflexiones',
      icon: Book,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      count: 47,
      recent: 3,
      path: '/mi-conocimiento/libros',
      stats: {
        completed: 35,
        inProgress: 5,
        planned: 7
      }
    },
    {
      id: 'cursos',
      title: 'Cursos',
      description: 'Formación académica y profesional',
      icon: GraduationCap,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      count: 23,
      recent: 2,
      path: '/mi-conocimiento/cursos',
      stats: {
        completed: 18,
        inProgress: 3,
        planned: 2
      }
    },
    {
      id: 'habilidades',
      title: 'Habilidades',
      description: 'Competencias y niveles de dominio',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      count: 28,
      recent: 4,
      path: '/mi-conocimiento/habilidades',
      stats: {
        completed: 0,
        inProgress: 0,
        planned: 0
      }
    }
  ];

  // Estadísticas generales
  const generalStats = {
    totalItems: knowledgeTypes.reduce((sum, type) => sum + type.count, 0),
    recentActivity: knowledgeTypes.reduce((sum, type) => sum + type.recent, 0),
    activeAreas: knowledgeTypes.length,
    completedThisMonth: 15
  };

  const handleCardClick = (item: any) => {
    if (!item.disabled) {
      navigate(item.path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Mi Conocimiento</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Gestiona y organiza todo tu aprendizaje personal
              </p>
            </div>
          </div>

          {/* Estadísticas Generales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{generalStats.totalItems}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{generalStats.recentActivity}</div>
                <div className="text-sm text-gray-600">Actividad Reciente</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{generalStats.activeAreas}</div>
                <div className="text-sm text-gray-600">Áreas Activas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{generalStats.completedThisMonth}</div>
                <div className="text-sm text-gray-600">Este Mes</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Grid de Cards de Conocimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {knowledgeTypes.map((item) => (
            <Card 
              key={item.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
              onClick={() => handleCardClick(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {item.title}
                </CardTitle>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contador principal */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className={`w-4 h-4 ${item.textColor}`} />
                    <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                    <span className="text-sm text-gray-500">elementos</span>
                  </div>
                  {item.recent > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">+{item.recent}</span>
                    </div>
                  )}
                </div>

                {/* Mini estadísticas */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`${item.bgColor} rounded-lg p-2`}>
                      <div className={`text-lg font-bold ${item.textColor}`}>
                        {item.stats.completed}
                      </div>
                      <div className="text-xs text-gray-600">Completados</div>
                    </div>
                    <div className={`${item.bgColor} rounded-lg p-2`}>
                      <div className={`text-lg font-bold ${item.textColor}`}>
                        {item.stats.inProgress}
                      </div>
                      <div className="text-xs text-gray-600">En Progreso</div>
                    </div>
                    <div className={`${item.bgColor} rounded-lg p-2`}>
                      <div className={`text-lg font-bold ${item.textColor}`}>
                        {item.stats.planned}
                      </div>
                      <div className="text-xs text-gray-600">Planificados</div>
                    </div>
                  </div>

                {/* Botones de acción */}
                <div className="pt-2 space-y-2">
                  <Button className={`w-full bg-gradient-to-r ${item.color} hover:opacity-90 transition-opacity`}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explorar
                  </Button>
                  
                  {/* Botones adicionales para Habilidades */}
                  {item.id === 'habilidades' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs border-purple-300 text-purple-700 hover:bg-purple-100 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/nuevo-aprendi');
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Nuevo aprendi
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-xs border-purple-300 text-purple-700 hover:bg-purple-100 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Conocimiento + clicked!'); // Debug visual
                          console.log('Conocimiento + clicked');
                        }}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Conocimiento +
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Card de agregar nuevo tipo */}
        <Card className="mt-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              ¿Falta algún tipo de conocimiento?
            </h3>
            <p className="text-gray-500 mb-4">
              Sugiérenos nuevas categorías para expandir tu gestión del conocimiento
            </p>
            <Button variant="outline">
              Sugerir Nueva Categoría
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MiConocimientoPage;