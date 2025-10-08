import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MemoriaModalSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memoria: any) => void;
}

const MemoriaModalSimple: React.FC<MemoriaModalSimpleProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('personal');

  const manejarGuardar = () => {
    if (!titulo.trim() || !contenido.trim()) {
      alert('Por favor completa el título y contenido');
      return;
    }

    const memoria = {
      titulo,
      contenido,
      categoria,
      fecha: new Date().toLocaleDateString(),
      etiquetas: [],
      importancia: 'media',
      tipo: 'nota',
      multimedia: []
    };

    onSave(memoria);
    setTitulo('');
    setContenido('');
    setCategoria('personal');
    onClose();
  };

  const manejarCancelar = () => {
    setTitulo('');
    setContenido('');
    setCategoria('personal');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={manejarCancelar}
      />
      
      {/* Modal */}
      <div className="relative z-50 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nueva Memoria</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={manejarCancelar}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Dale un título a tu memoria..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="personal">Personal</option>
              <option value="trabajo">Trabajo</option>
              <option value="familia">Familia</option>
              <option value="aprendizaje">Aprendizaje</option>
              <option value="ideas">Ideas</option>
              <option value="viajes">Viajes</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div>
            <Label htmlFor="contenido">Contenido</Label>
            <textarea
              id="contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe aquí tu memoria..."
              rows={6}
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <Button onClick={manejarGuardar} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            Guardar Memoria
          </Button>
          <Button variant="outline" onClick={manejarCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemoriaModalSimple;