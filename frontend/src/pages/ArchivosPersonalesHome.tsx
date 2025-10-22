import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Database } from 'lucide-react';

const ArchivosPersonalesHome: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToType = (type: string) => {
    navigate(`/twin-biografia/archivos-personales/${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Archivos Personales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organiza y gestiona tus documentos por tipo de estructura. 
            Cada categoría está optimizada para diferentes tipos de archivos y necesidades de procesamiento.
          </p>
        </div>

        {/* Cards principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Documentos Estructurados */}
          <div 
            onClick={() => handleNavigateToType('estructurados')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-200"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Documentos Estructurados
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Archivos con estructura de datos predefinida y organizada. 
                Perfectos para análisis automático y procesamiento de datos.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  CSV - Hojas de cálculo y datos tabulares
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  JSON - Datos de aplicaciones web
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  XML - Documentos de intercambio
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Base de datos - Archivos de datos
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Gestionar Estructurados
              </button>
            </div>
          </div>

          {/* Documentos Semi-estructurados */}
          <div 
            onClick={() => handleNavigateToType('semi-estructurados')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-200"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Documentos Semi-estructurados
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Documentos con estructura parcial que combinan campos predefinidos 
                con contenido libre. Ideales para formularios y documentos oficiales.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Facturas - Comprobantes comerciales
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Licencias - Permisos y autorizaciones
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Certificados - Documentos académicos
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Estados de cuenta - Informes financieros
                </div>
              </div>
              <button className="w-full mt-6 bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium">
                Gestionar Semi-estructurados
              </button>
            </div>
          </div>

          {/* Documentos No estructurados */}
          <div 
            onClick={() => handleNavigateToType('no-estructurados')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-200"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Documentos No Estructurados
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Documentos de texto libre sin estructura predefinida. 
                Requieren procesamiento de lenguaje natural para su análisis.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Contratos - Documentos legales
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Reportes - Informes técnicos
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Emails - Correspondencia digital
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Artículos - Contenido académico
                </div>
              </div>
              <button className="w-full mt-6 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Gestionar No Estructurados
              </button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Cómo elegir el tipo correcto?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Estructurados</h4>
              <p className="text-sm text-gray-600">
                Si tu archivo tiene columnas, campos definidos o estructura de datos clara.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Semi-estructurados</h4>
              <p className="text-sm text-gray-600">
                Si tiene formularios, campos específicos pero también texto libre.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">No estructurados</h4>
              <p className="text-sm text-gray-600">
                Si es principalmente texto libre, narrativo o sin estructura fija.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivosPersonalesHome;