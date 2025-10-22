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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SUBCATEGORIAS_SEMI_ESTRUCTURADOS.map((subcategoria) => {
            const IconComponent = subcategoria.iconComponent;
            return (
              <div
                key={subcategoria.id}
                className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => navigate(subcategoria.navigationPath)}
              >
                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <IconComponent className={`w-8 h-8 text-white`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {subcategoria.label}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="text-2xl mr-2">{subcategoria.icon}</span>
                      <span>Gestionar documentos</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {subcategoria.description}
                </p>

                {/* Action Button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Haz clic para gestionar
                  </span>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
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

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              💡 Documentos Semi-estructurados
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Los documentos semi-estructurados contienen información organizada en campos y secciones específicas. 
              Cada tipo de documento tiene su propia página dedicada donde podrás subir, organizar y gestionar 
              todos tus archivos de manera eficiente con funcionalidades específicas para cada categoría.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Facturas</h3>
              <p className="text-sm text-gray-600">Análisis inteligente con extracción de datos estructurados</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Licencias y Certificados</h3>
              <p className="text-sm text-gray-600">Gestión organizada de documentos oficiales</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Estados y Formularios</h3>
              <p className="text-sm text-gray-600">Administración eficiente de documentos bancarios y oficiales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentosSemiEstructurados;