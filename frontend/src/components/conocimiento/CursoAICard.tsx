import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, User, Clock, BookOpenCheck, Edit, Eye } from 'lucide-react';
import { CursoCreadoAI } from '@/types/cursoAI';
import { useNavigate } from 'react-router-dom';

interface Props {
  curso: CursoCreadoAI & { id?: string };
}

const CursoAICard: React.FC<Props> = ({ curso }) => {
  const navigate = useNavigate();
  const titulo = curso.NombreClase || 'Curso AI sin título';
  const instructor = 'Twin Class AI';
  const duracion = curso.DuracionEstimada || '0 horas';
  const categorias = (curso.Etiquetas || []).slice(0, 3);
  const extraCount = (curso.Etiquetas || []).length - categorias.length;
  const resumen = curso.Descripcion || curso.Capitulos?.[0]?.Resumen || '';
  const capCount = curso.Capitulos ? curso.Capitulos.length : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">Curso AI</Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{titulo}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{instructor}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{duracion}</span>
        </div>

        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categorias.map((et, i) => (
              <Badge key={i} variant="outline" className="text-xs border-purple-200 text-purple-700">{et}</Badge>
            ))}
            {extraCount > 0 && (
              <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">+{extraCount}</Badge>
            )}
          </div>
        )}

        {resumen && (
          <p className="text-sm text-gray-600 line-clamp-3">{resumen}</p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/mi-conocimiento/cursosAI/editar/${curso.id}`)}>
              <Edit className="w-4 h-4 mr-1" />Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/mi-conocimiento/cursosAI/detalles/${curso.id}`, { state: { cursoAI: curso, esAI: true } })}>
              <Eye className="w-4 h-4 mr-1" />Ver Detalles
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200" onClick={() => navigate(`/mi-conocimiento/cursosAI/${curso.id}/capitulos`, { state: { cursoAI: curso } })}>
            <BookOpenCheck className="w-4 h-4 mr-1" />Ver Capítulos ({capCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CursoAICard;
