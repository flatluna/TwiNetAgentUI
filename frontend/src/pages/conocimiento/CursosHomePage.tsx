import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CursosHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Selecciona cómo deseas crear o administrar tus cursos</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col justify-between">
            <CardHeader className="p-0">
              <div className="flex items-center gap-3">
                <Plus className="w-6 h-6 text-green-600" />
                <CardTitle className="text-lg font-semibold">Cursos Manuales</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <p className="text-sm text-gray-600">Crear un curso manualmente: define título, capítulos y contenido. Desde aquí verás los cursos manuales existentes y accederás a la opción para crear uno nuevo.</p>
            </CardContent>
            <div className="mt-6">
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate('/mi-conocimiento/cursos/manual')}>Seleccionar Cursos manuales</Button>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <CardHeader className="p-0">
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-lg font-semibold">Cursos desde Documento</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <p className="text-sm text-gray-600">Sube un PDF o documento y genera un curso automáticamente a partir del contenido. Desde aquí verás los cursos generados desde documentos y podrás crear uno nuevo.</p>
            </CardContent>
            <div className="mt-6">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/mi-conocimiento/cursos/documento')}>Seleccionar Cursos desde documento</Button>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <CardHeader className="p-0">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-lg font-semibold">Cursos AI</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <p className="text-sm text-gray-600">Genera un curso usando IA: define tópicos y parámetros y el agente creará la estructura. Desde aquí verás los cursos creados por AI y podrás iniciar la generación.</p>
            </CardContent>
            <div className="mt-6">
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/mi-conocimiento/cursos/ai')}>Seleccionar Cursos AI</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CursosHomePage;
