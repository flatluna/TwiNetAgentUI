import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Clock, BookOpen, Target, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IndexAI { IndexNumero: string; Titulo: string; Pagina: number }
interface PreguntaQuizAI { Pregunta: string; Opciones: string[]; RespuestaCorrecta: string; Explicacion: string }
interface CapituloCreadoAI { Titulo: string; Objetivos: string[]; Contenido: string; Ejemplos: string[]; Resumen: string; Pagina: number; Quizes: PreguntaQuizAI[] }
interface CursoCreadoAI { Indice: IndexAI[]; NombreClase: string; Descripcion: string; Capitulos: CapituloCreadoAI[]; DuracionEstimada: string; Etiquetas: string[]; TwinID: string; id: string }

interface Props { 
  curso: CursoCreadoAI;
  isFromDocument?: boolean; // Nueva prop para indicar si es de documento
}

const CursoAIPageCard: React.FC<Props> = ({ curso, isFromDocument = false }) => {
  const navigate = useNavigate();
  const titulo = curso.NombreClase || 'Curso AI sin título';
  const descripcion = curso.Descripcion || '';
  const duracion = curso.DuracionEstimada || '';
  const etiquetas = Array.isArray(curso.Etiquetas) ? curso.Etiquetas : [];
  const capCount = Array.isArray(curso.Capitulos) ? curso.Capitulos.length : 0;
  
  // Calcular total de objetivos en todos los capítulos
  const totalObjetivos = curso.Capitulos?.reduce((total, cap) => {
    // Para cursos AI: cap.Objetivos (array)
    // Para cursos documento: no tienen objetivos específicos, usar 1 por capítulo
    if (isFromDocument) {
      return total + 1; // Cada capítulo cuenta como 1 objetivo
    }
    return total + (Array.isArray(cap.Objetivos) ? cap.Objetivos.length : 0);
  }, 0) || 0;
  
  // Calcular total de quizzes
  const totalQuizzes = curso.Capitulos?.reduce((total, cap) => {
    // Para cursos AI: cap.Quizes (array)
    // Para cursos documento: cap.quiz (array)
    if (isFromDocument) {
      const quiz = (cap as any).quiz;
      return total + (Array.isArray(quiz) ? quiz.length : 0);
    }
    return total + (Array.isArray(cap.Quizes) ? cap.Quizes.length : 0);
  }, 0) || 0;

  return (
    <Card className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-0 bg-white overflow-hidden relative">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Top accent border */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200 font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                Generado por IA
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              {titulo}
            </CardTitle>
            {descripcion && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {descripcion}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border">
            <BookOpen className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-lg font-bold text-gray-900">{capCount}</span>
            <span className="text-xs text-gray-600">Capítulos</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border">
            <Target className="w-5 h-5 text-green-600 mb-1" />
            <span className="text-lg font-bold text-gray-900">{totalObjetivos}</span>
            <span className="text-xs text-gray-600">Objetivos</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border">
            <Users className="w-5 h-5 text-orange-600 mb-1" />
            <span className="text-lg font-bold text-gray-900">{totalQuizzes}</span>
            <span className="text-xs text-gray-600">Quizzes</span>
          </div>
        </div>

        {/* Duration */}
        {duracion && (
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">{duracion}</span>
          </div>
        )}

        {/* Tags */}
        {etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {etiquetas.slice(0,3).map((t, i) => (
              <Badge 
                key={`${curso.id}-tag-${i}`} 
                variant="outline" 
                className="text-xs px-2 py-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                {t}
              </Badge>
            ))}
            {etiquetas.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                +{etiquetas.length - 3} más
              </Badge>
            )}
          </div>
        )}

        {/* Action button */}
        <Button
          aria-label={`Comenzar ${titulo}`}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          onClick={() => {
            if (isFromDocument) {
              // Para cursos generados desde documento, navegar a la nueva página de estudio
              navigate(`/mi-conocimiento/cursos/documento/${curso.id}`, { 
                state: { 
                  curso: curso,
                  esAI: true, 
                  esDocumento: true,
                  CursosInternet: (curso as any).CursosInternet || (curso as any).cursosInternet || null, 
                  cursosInternet: (curso as any).cursosInternet || (curso as any).CursosInternet || null 
                } 
              });
            } else {
              // Para cursos AI puros, usar la ruta original
              navigate(`/mi-conocimiento/cursosAI/overview/${curso.id}`, { 
                state: { 
                  cursoAI: curso, 
                  esAI: true, 
                  CursosInternet: (curso as any).CursosInternet || (curso as any).cursosInternet || null, 
                  cursosInternet: (curso as any).cursosInternet || (curso as any).CursosInternet || null 
                } 
              });
            }
          }}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          {isFromDocument ? 'Estudiar Curso' : 'Comenzar Curso'}
        </Button>

        {/* AI Disclaimer */}
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 leading-relaxed">
            ⚠️ <strong>Curso generado por IA:</strong> La información puede no estar completa, al día o actualizada. 
            Depende del modelo de IA y cuándo se instaló en Azure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CursoAIPageCard;
