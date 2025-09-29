import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Code, 
  Play, 
  Save, 
  Download, 
  Copy, 
  Edit3, 
  Trash2,
  Plus,
  Eye,
  EyeOff,
  FileText,
  Clock,
  Calendar,
  User,
  Tag,
  Star,
  ChevronRight,
  Terminal,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { 
  NotebookCapitulo, 
  DocumentoCapitulo,
} from '@/types/conocimiento';
import { useTwinId } from '@/hooks/useTwinId';

const NotebooksCapituloPage: React.FC = () => {
  const { cursoId, capituloId } = useParams<{ cursoId: string; capituloId: string }>();
  const navigate = useNavigate();
  const { twinId, loading: twinIdLoading } = useTwinId();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'notebooks' | 'documentos'>('notebooks');
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  
  // Estados para notebooks
  const [notebooks, setNotebooks] = useState<NotebookCapitulo[]>([
    {
      id: '1',
      capituloId: capituloId!,
      titulo: 'Análisis de Datos con Pandas',
      descripcion: 'Introducción al análisis de datos usando pandas en Python',
      codigo: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Cargar datos de ejemplo
df = pd.read_csv('datos_ejemplo.csv')

# Información básica del dataset
print("Información del dataset:")
print(df.info())

# Estadísticas descriptivas
print("\\nEstadísticas descriptivas:")
print(df.describe())

# Primeras 5 filas
print("\\nPrimeras 5 filas:")
print(df.head())

# Gráfico simple
plt.figure(figsize=(10, 6))
df['columna_numerica'].hist(bins=20)
plt.title('Distribución de datos')
plt.xlabel('Valores')
plt.ylabel('Frecuencia')
plt.show()`,
      lenguaje: 'python',
      fechaCreacion: new Date('2024-01-15'),
      fechaActualizacion: new Date('2024-01-20'),
      ejecutable: true,
      estado: 'completed',
      resultadoEjecucion: 'Ejecutado correctamente - Dataset cargado con 1000 filas y 5 columnas',
      tiempoEjecucion: 2.5,
      version: '1.2',
      tags: ['pandas', 'análisis', 'visualización'],
      notas: 'Notebook completado. Incluye ejemplos prácticos de análisis exploratorio.'
    },
    {
      id: '2',
      capituloId: capituloId!,
      titulo: 'Visualizaciones Avanzadas',
      descripcion: 'Creación de gráficos avanzados con matplotlib y seaborn',
      codigo: `import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Configurar estilo
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

# Crear subplots
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Gráfico 1: Histograma
axes[0,0].hist(data['variable1'], bins=30, alpha=0.7)
axes[0,0].set_title('Distribución Variable 1')

# Gráfico 2: Scatter plot
axes[0,1].scatter(data['x'], data['y'], alpha=0.6)
axes[0,1].set_title('Relación X vs Y')

# Gráfico 3: Box plot
sns.boxplot(data=data, x='categoria', y='valor', ax=axes[1,0])
axes[1,0].set_title('Distribución por Categoría')

# Gráfico 4: Heatmap
correlation_matrix = data.corr()
sns.heatmap(correlation_matrix, annot=True, ax=axes[1,1])
axes[1,1].set_title('Matriz de Correlación')

plt.tight_layout()
plt.show()`,
      lenguaje: 'python',
      fechaCreacion: new Date('2024-01-16'),
      fechaActualizacion: new Date('2024-01-21'),
      ejecutable: true,
      estado: 'working',
      resultadoEjecucion: null,
      tiempoEjecucion: null,
      version: '1.0',
      tags: ['matplotlib', 'seaborn', 'visualización'],
      notas: 'En desarrollo. Falta agregar más tipos de gráficos.'
    }
  ]);

  // Estados para documentos
  const [documentos, setDocumentos] = useState<DocumentoCapitulo[]>([
    {
      id: '1',
      capituloId: capituloId!,
      titulo: 'Manual de Pandas',
      descripcion: 'Guía completa de funciones y métodos de pandas',
      tipoDocumento: 'pdf',
      tamanoBytes: 2048576, // 2MB
      urlArchivo: '/documentos/manual-pandas.pdf',
      fechaSubida: new Date('2024-01-10'),
      tags: ['documentación', 'pandas', 'referencia'],
      notas: 'Documento oficial traducido al español'
    },
    {
      id: '2',
      capituloId: capituloId!,
      titulo: 'Dataset de Ejemplo',
      descripcion: 'Datos de ventas para practicar análisis',
      tipoDocumento: 'excel',
      tamanoBytes: 512000, // 500KB
      urlArchivo: '/datasets/ventas-ejemplo.xlsx',
      fechaSubida: new Date('2024-01-12'),
      tags: ['dataset', 'práctica', 'ventas'],
      notas: 'Datos sintéticos para ejercicios'
    }
  ]);

  const [showCode, setShowCode] = useState<{ [key: string]: boolean }>({});

  const toggleCodeVisibility = (notebookId: string) => {
    setShowCode(prev => ({
      ...prev,
      [notebookId]: !prev[notebookId]
    }));
  };

  const executeNotebook = (notebookId: string) => {
    // Simular ejecución
    console.log(`Ejecutando notebook ${notebookId}`);
    // Aquí iría la lógica real de ejecución
  };

  const downloadNotebook = (notebook: NotebookCapitulo) => {
    const content = JSON.stringify({
      cells: [
        {
          cell_type: "markdown",
          source: [`# ${notebook.titulo}\n\n${notebook.descripcion || ''}`]
        },
        {
          cell_type: "code",
          source: notebook.codigo.split('\n'),
          language: notebook.lenguaje
        }
      ]
    }, null, 2);
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${notebook.titulo}.ipynb`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyNotebookCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    // Mostrar toast de confirmación
  };

  const getLanguageColor = (lenguaje: string) => {
    const colors: { [key: string]: string } = {
      python: 'bg-blue-100 text-blue-800 border-blue-200',
      javascript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      typescript: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      r: 'bg-purple-100 text-purple-800 border-purple-200',
      sql: 'bg-green-100 text-green-800 border-green-200',
      julia: 'bg-pink-100 text-pink-800 border-pink-200',
      markdown: 'bg-gray-100 text-gray-800 border-gray-200',
      other: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[lenguaje] || colors.other;
  };

  const getDocumentIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'excel':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'word':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'powerpoint':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (twinIdLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando notebooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/cursos/${cursoId}/capitulos`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Capítulos
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notebooks y Documentos
            </h1>
            <p className="text-gray-600">Capítulo: Análisis de Datos con Python</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('notebooks')}
          className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'notebooks'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Notebooks ({notebooks.length})
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'documentos'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Documentos ({documentos.length})
        </button>
      </div>

      {/* Notebooks Tab */}
      {activeTab === 'notebooks' && (
        <div className="space-y-6">
          {notebooks.map((notebook) => (
            <Card key={notebook.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 mb-2">
                      <Code className="w-5 h-5 text-blue-600" />
                      {notebook.titulo}
                      <Badge className={getLanguageColor(notebook.lenguaje)}>
                        {notebook.lenguaje.toUpperCase()}
                      </Badge>
                      <Badge variant={notebook.estado === 'completed' ? 'default' : 'secondary'}>
                        {notebook.estado === 'completed' ? 'Completado' : 
                         notebook.estado === 'working' ? 'En progreso' : 
                         notebook.estado === 'error' ? 'Error' : 'Borrador'}
                      </Badge>
                    </CardTitle>
                    {notebook.descripcion && (
                      <p className="text-gray-600 mb-3">{notebook.descripcion}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Actualizado: {notebook.fechaActualizacion.toLocaleDateString()}
                      </span>
                      {notebook.tiempoEjecucion && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {notebook.tiempoEjecucion}s
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Terminal className="w-4 h-4" />
                        v{notebook.version}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCodeVisibility(notebook.id!)}
                    >
                      {showCode[notebook.id!] ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Código
                        </>
                      )}
                    </Button>
                    {notebook.ejecutable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeNotebook(notebook.id!)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Ejecutar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadNotebook(notebook)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {showCode[notebook.id!] && (
                <CardContent>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {notebook.lenguaje}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyNotebookCode(notebook.codigo)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{notebook.codigo}</code>
                    </pre>
                    {notebook.resultadoEjecucion && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Terminal className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Resultado de Ejecución:</span>
                        </div>
                        <p className="text-sm text-green-700">{notebook.resultadoEjecucion}</p>
                      </div>
                    )}
                  </div>
                  
                  {notebook.tags && notebook.tags.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Tags:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {notebook.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {notebook.notas && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Notas:</span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {notebook.notas}
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Documentos Tab */}
      {activeTab === 'documentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentos.map((documento) => (
            <Card key={documento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getDocumentIcon(documento.tipoDocumento)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {documento.titulo}
                    </h3>
                    {documento.descripcion && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {documento.descripcion}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {documento.tipoDocumento.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(documento.tamanoBytes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {documento.fechaSubida.toLocaleDateString()}
                    </div>
                    
                    {documento.tags && documento.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {documento.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {documento.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{documento.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => window.open(documento.urlArchivo, '_blank')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex-1"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = documento.urlArchivo;
                          link.download = documento.titulo;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotebooksCapituloPage;