import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, X, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTwinId } from '@/hooks/useTwinId';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';

const CrearCursoAIPage: React.FC = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [capitulos, setCapitulos] = useState<number | ''>('');
  const [paginas, setPaginas] = useState<number | ''>('');
  const [topicos, setTopicos] = useState<string[]>([]);
  const [newTopico, setNewTopico] = useState('');
  const [idioma, setIdioma] = useState('');
  const [tipoModelo, setTipoModelo] = useState('gpt4');
  const idiomasDisponibles = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Japonés', 'Ruso', 'Árabe'];
  const tiposModelo = [
    { value: 'gpt4', label: 'gpt4' },
    { value: 'gpt5', label: 'gpt5' }
  ];

  const agregarTopico = () => {
    const t = newTopico.trim();
    if (!t) return;
    setTopicos((s) => [...s, t]);
    setNewTopico('');
  };

  const removerTopico = (idx: number) => {
    setTopicos((s) => s.filter((_, i) => i !== idx));
  };

  const { twinId, loading: twinLoading } = useTwinId();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedCurso, setSavedCurso] = useState<any | null>(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!twinId) {
      setMessage('No se encontró TwinID. Por favor, inicia sesión.');
      return;
    }

    const payload = {
      NombreClase: nombre,
      Descripcion: descripcion,
      CantidadCapitulos: typeof capitulos === 'number' ? capitulos : 0,
      CantidadPaginas: typeof paginas === 'number' ? paginas : 0,
      ListaTopicos: topicos,
      TwinID: twinId,
      Idioma: idioma || 'Español', // Default to Español if not selected
      id: undefined,
    } as any;

    try {
      setSubmitting(true);
      setProgressModalOpen(true);
      setProgress(0);
      setCurrentStep('Iniciando creación del curso...');

      // Simular progreso durante la creación
      const progressSteps = [
        { step: 'Analizando contenido y tópicos...', progress: 15, delay: 1000 },
        { step: 'Buscando información en Internet...', progress: 30, delay: 2000 },
        { step: 'Generando estructura del curso...', progress: 50, delay: 1500 },
        { step: 'Creando capítulos y contenido...', progress: 70, delay: 2500 },
        { step: 'Obteniendo enlaces a cursos de referencia...', progress: 85, delay: 1500 },
        { step: 'Finalizando curso...', progress: 95, delay: 1000 }
      ];

      // Ejecutar pasos de progreso en paralelo con la petición
      const progressPromise = progressSteps.reduce((promise, { step, progress, delay }) => {
        return promise.then(() => new Promise(resolve => {
          setTimeout(() => {
            setCurrentStep(step);
            setProgress(progress);
            resolve(undefined);
          }, delay);
        }));
      }, Promise.resolve());

      const res = await fetch(`/api/twins/${encodeURIComponent(twinId)}/${encodeURIComponent(tipoModelo)}/cursos/agent/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
      }

  const data = await res.json();
  console.log('BuildCurso response:', data);

  // Esperamos que el backend devuelva { success: true, clase: aiResult, message: '...' }
  const saved = (data && data.clase) ? data.clase : data;
  setSavedCurso(saved || null);
  setMessage(data?.message || 'Curso creado correctamente');
  setModalOpen(true);
    } catch (err: any) {
      console.error('Error creando curso AI:', err);
      setMessage(`No se pudo crear el curso: ${err.message || err}`);
    } finally {
      setSubmitting(false);
      setProgress(100);
      setCurrentStep('¡Curso creado exitosamente!');
      setTimeout(() => {
        setProgressModalOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/mi-conocimiento/cursos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Cursos
          </Button>
          <h1 className="text-2xl font-bold">Agregar Curso con AI</h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Datos del curso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del curso</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Álgebra básica" />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción detallada</Label>
                <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={5} placeholder="Describe el curso en detalle, objetivos y público objetivo" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capitulos">¿Cuántos capítulos?</Label>
                  <Input id="capitulos" type="number" value={capitulos} onChange={(e) => setCapitulos(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej. 10" />
                </div>
                <div>
                  <Label htmlFor="paginas">¿Cuántas páginas?</Label>
                  <Input id="paginas" type="number" value={paginas} onChange={(e) => setPaginas(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej. 120" />
                </div>
              </div>

              <div>
                <Label>Lista de tópicos</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {topicos.map((t, i) => (
                    <div key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center gap-2">
                      <span className="text-sm">{t}</span>
                      <button type="button" onClick={() => removerTopico(i)} className="p-1 rounded-full hover:bg-purple-200">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Input value={newTopico} onChange={(e) => setNewTopico(e.target.value)} placeholder="Agregar tópico, ej. fracciones" />
                  <Button type="button" onClick={agregarTopico} className="col-span-1 bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" /> Agregar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="idioma">Idioma del curso</Label>
                <Select id="idioma" value={idioma} onChange={(e) => setIdioma(e.target.value)}>
                  <option value="" disabled>Selecciona un idioma</option>
                  {idiomasDisponibles.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="tipoModelo">Modelo de IA</Label>
                <Select id="tipoModelo" value={tipoModelo} onChange={(e) => setTipoModelo(e.target.value)}>
                  {tiposModelo.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate('/mi-conocimiento/cursos')}>Cancelar</Button>
                <Button type="submit" disabled={submitting || twinLoading} className="bg-purple-600 hover:bg-purple-700">
                  {submitting ? 'Creando...' : (<><Check className="w-4 h-4 mr-2" /> Crear Curso</>)}
                </Button>
              </div>
              {message && (
                <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {message}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Modal de progreso */}
        <Dialog open={progressModalOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Creando Curso con IA
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Este proceso puede tomar varios minutos. La IA está trabajando para crear el mejor curso para ti.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">{currentStep}</p>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>🔍 <strong>Búsqueda en Internet:</strong> Recopilando información actualizada</p>
                <p>🏗️ <strong>Creación de capítulos:</strong> Estructurando contenido pedagógico</p>
                <p>🔗 <strong>Enlaces de referencia:</strong> Encontrando cursos reales relacionados</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  ⏰ <strong>Tiempo estimado:</strong> Este proceso puede tardar entre 2-5 minutos dependiendo de la complejidad del curso y la velocidad de respuesta de la IA.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={modalOpen} onOpenChange={(open) => setModalOpen(open)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Curso generado correctamente</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Se creó el curso con los datos generados por el agente. Aquí tienes un resumen ejecutivo.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4">
              {savedCurso ? (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">{savedCurso.NombreClase || savedCurso.Nombre || 'Sin nombre'}</h3>
                  <p className="text-sm text-gray-700">{savedCurso.Descripcion}</p>

                  <div className="flex gap-4">
                    <div className="text-sm text-gray-600">Capítulos: <span className="font-medium">{savedCurso.CantidadCapitulos}</span></div>
                    <div className="text-sm text-gray-600">Páginas: <span className="font-medium">{savedCurso.CantidadPaginas}</span></div>
                    <div className="text-sm text-gray-600">TwinID: <span className="font-medium">{savedCurso.TwinID}</span></div>
                  </div>

                  <div>
                    <h4 className="font-medium">Tópicos principales</h4>
                    <ul className="list-disc list-inside">
                      {Array.isArray(savedCurso.ListaTopicos) && savedCurso.ListaTopicos.map((t: string, i: number) => (
                        <li key={i} className="text-sm">{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setModalOpen(false); navigate('/mi-conocimiento/cursos'); }}>Ir a cursos</Button>
                    <Button onClick={() => { setModalOpen(false); if (savedCurso?.id) navigate(`/mi-conocimiento/cursos/${savedCurso.id}`); }}>Ver curso</Button>
                  </div>
                </div>
              ) : (
                <div>No se recibió información del curso guardado.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CrearCursoAIPage;
