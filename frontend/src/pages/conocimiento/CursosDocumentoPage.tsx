import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import CursosSection from '@/components/conocimiento/CursosSection';
import { Button } from '@/components/ui/button';

const CursosDocumentoPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cursos desde Documento</h1>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/mi-conocimiento/cursos/agregar-documento')}><Upload className="w-4 h-4 mr-2"/>Agregar Curso con Documento</Button>
        </div>

        {/* TwinCursos agent placeholder specific to document-generated courses */}
        <div className="mb-6 p-4 border rounded bg-white">
          <h2 className="text-lg font-medium mb-2">TwinCursos - Agente</h2>
          <p className="text-sm text-gray-600 mb-3">Pregunta sobre cursos generados desde documentos (p. ej. "¿Qué temas cubre el curso Y?").</p>
          <div className="flex gap-2">
            <input className="flex-1 border rounded px-3 py-2" placeholder="Escribe tu pregunta..." />
            <Button>Preguntar</Button>
          </div>
        </div>

        <CursosSection onlyTipo="document" />
      </div>
    </div>
  );
};

export default CursosDocumentoPage;
