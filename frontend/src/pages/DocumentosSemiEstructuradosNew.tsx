import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Award, CreditCard, ClipboardList, FileText } from 'lucide-react';

const SUBCATEGORIAS_SEMI_ESTRUCTURADOS = [
    { 
        id: "invoice", 
        label: "Facturas", 
        icon: "🧾", 
        description: "Facturas comerciales y recibos de pago",
        iconComponent: DollarSign,
        color: "text-green-600",
        navigationPath: "/twin-biografia/facturas"
    },
    { 
        id: "license", 
        label: "Licencias", 
        icon: "📜", 
        description: "Licencias profesionales, permisos y autorizaciones",
        iconComponent: Award,
        color: "text-blue-600",
        navigationPath: "/twin-biografia/licencias"
    },
    { 
        id: "certificate", 
        label: "Certificados", 
        icon: "🏆", 
        description: "Certificados académicos, profesionales y de capacitación",
        iconComponent: Award,
        color: "text-yellow-600",
        navigationPath: "/twin-biografia/certificados"
    },
    { 
        id: "account_statement", 
        label: "Estados de cuenta", 
        icon: "💳", 
        description: "Estados bancarios, financieros y de servicios",
        iconComponent: CreditCard,
        color: "text-purple-600",
        navigationPath: "/twin-biografia/estados-cuenta"
    },
    { 
        id: "form", 
        label: "Formularios", 
        icon: "📋", 
        description: "Formularios oficiales, solicitudes y registros",
        iconComponent: ClipboardList,
        color: "text-orange-600",
        navigationPath: "/twin-biografia/formularios"
    }
];

const DocumentosSemiEstructurados: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/twin-biografia/archivos-personales')}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span>📄 Documentos Semi-estructurados</span>
              </h1>
              <p className="text-gray-600 mt-1">Selecciona el tipo de documento semi-estructurado que deseas gestionar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {SUBCATEGORIAS_SEMI_ESTRUCTURADOS.map((subcategoria) => {
            const IconComponent = subcategoria.iconComponent;
            return (
              <div
                key={subcategoria.id}
                className="group bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                onClick={() => navigate(subcategoria.navigationPath)}
              >
                {/* Compact Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <IconComponent className={`w-6 h-6 text-white`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {subcategoria.label}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="text-lg mr-1">{subcategoria.icon}</span>
                      <span className="truncate">Gestionar documentos</span>
                    </div>
                  </div>
                </div>

                {/* Compressed Description */}
                <p className="text-gray-600 text-sm mb-3 leading-snug overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const
                }}>
                  {subcategoria.description}
                </p>

                {/* Compact Action Footer */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 truncate">
                    Haz clic para gestionar
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r flex-shrink-0 ${
                    subcategoria.id === 'invoice' ? 'from-green-400 to-emerald-500' :
                    subcategoria.id === 'license' ? 'from-blue-400 to-indigo-500' :
                    subcategoria.id === 'certificate' ? 'from-yellow-400 to-orange-500' :
                    subcategoria.id === 'account_statement' ? 'from-purple-400 to-pink-500' :
                    'from-orange-400 to-red-500'
                  }`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              💡 Documentos Semi-estructurados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-sm">
              Los documentos semi-estructurados contienen información organizada en campos específicos. 
              Cada tipo tiene su página dedicada para subir, organizar y gestionar archivos eficientemente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Facturas</h3>
              <p className="text-xs text-gray-600">Análisis inteligente con extracción de datos</p>
            </div>
            
            <div className="text-center p-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Licencias y Certificados</h3>
              <p className="text-xs text-gray-600">Gestión de documentos oficiales</p>
            </div>
            
            <div className="text-center p-3 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Estados y Formularios</h3>
              <p className="text-xs text-gray-600">Documentos bancarios y oficiales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentosSemiEstructurados;