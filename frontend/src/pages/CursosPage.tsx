import React from 'react';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CursosSection from '@/components/conocimiento/CursosSection';

const CursosPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/mi-conocimiento')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Mi Conocimiento
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Mis Cursos</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Formación académica y profesional
              </p>
            </div>
          </div>
        </div>

        {/* Contenido de la sección de cursos */}
        <CursosSection />
      </div>
    </div>
  );
};

export default CursosPage;