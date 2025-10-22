import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const SUBCATEGORIAS_ESTRUCTURADOS = [
  'CSV',
  'JSON',
  'XML',
  'Base de datos'
];

const DocumentosEstructurados: React.FC = () => {
  const navigate = useNavigate();

  const handleAbrirPagina = (subcategoria: string) => {
    // Navegar a páginas específicas para cada tipo de documento
    switch (subcategoria) {
      case 'CSV':
        navigate('/twin-biografia/archivos-personales/estructurados/csv');
        break;
      case 'JSON':
        navigate('/twin-biografia/archivos-personales/estructurados/json');
        break;
      case 'XML':
        navigate('/twin-biografia/archivos-personales/estructurados/xml');
        break;
      case 'Base de datos':
        navigate('/twin-biografia/archivos-personales/estructurados/database');
        break;
      default:
        console.log(`Página no implementada para: ${subcategoria}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/twin-biografia/archivos-personales')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Documentos Estructurados
          </h1>
        </div>

        {/* Descripción */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            Los documentos estructurados contienen datos organizados en formato predefinido con estructura clara. 
            Son ideales para análisis automático, importación de datos y procesamiento sistemático.
          </p>
        </div>

        {/* Grid de subcategorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBCATEGORIAS_ESTRUCTURADOS.map((subcategoria) => (
            <div
              key={subcategoria}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {subcategoria}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {subcategoria === 'CSV' && 'Archivos de valores separados por comas, hojas de cálculo'}
                  {subcategoria === 'JSON' && 'Datos JavaScript Object Notation, APIs y configuraciones'}
                  {subcategoria === 'XML' && 'Documentos de marcado extensible, intercambio de datos'}
                  {subcategoria === 'Base de datos' && 'Archivos de base de datos SQL, SQLite, dumps'}
                </p>
                <button
                  onClick={() => handleAbrirPagina(subcategoria)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Abrir página {subcategoria}
                </button>
              </div>
            </div>
          ))}
        </div>




      </div>
    </div>
  );
};

export default DocumentosEstructurados;