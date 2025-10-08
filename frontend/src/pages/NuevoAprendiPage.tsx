import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Plus,
  Save,
  ArrowLeft,
  BookOpen,
  Edit3,
  Trash2,
  Search,
  Calendar,
  Tag,
  FileText,
  Target,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLearningApi } from '@/services/learningApiService';
import { SkillData, NewLearning, SkillLearningSearchResult } from '@/services/skillsApiService';
import LearningAIEnhancementModal from '@/components/LearningAIEnhancementModal';
import LearningResourcesReviewModal from '@/components/LearningResourcesReviewModal';
import AIProcessingModal from '@/components/AIProcessingModal';
import { toast, Toaster } from 'react-hot-toast';

// Importar React Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Tipo expandido para mostrar aprendizajes con contexto
interface LearningWithSkill extends NewLearning {
  skillId: string;
  skillName: string;
  description?: string;
  searchResults?: SkillLearningSearchResult;
}

// Configuración de React Quill
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image'],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['blockquote', 'code-block'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'link', 'image', 'align', 'color', 'background',
  'blockquote', 'code-block'
];

const NuevoAprendiPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { 
    loading, 
    addLearningToSkill, 
    updateLearning, 
    deleteLearning,
    getSkillsForLearning,
    enhanceLearningWithAI,
    updateLearningSearchResults
  } = useLearningApi();
  
  // Obtener la habilidad pasada como parámetro de navegación
  const skillFromState = location.state?.skill as SkillData | undefined;
  
  // Estados
  const [currentSkill, setCurrentSkill] = useState<SkillData | null>(skillFromState || null);
  const [allLearnings, setAllLearnings] = useState<LearningWithSkill[]>([]);
  const [selectedLearning, setSelectedLearning] = useState<LearningWithSkill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  }>({ message: '', type: 'info', show: false });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    content: '',
    skillId: id || ''
  });
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEnhancingWithAI, setIsEnhancingWithAI] = useState(false);
  const [isResourcesReviewOpen, setIsResourcesReviewOpen] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isViewingAIResources, setIsViewingAIResources] = useState(false);
  const [aiResourcesData, setAiResourcesData] = useState<any>(null);

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Función para refrescar la habilidad actual desde el backend
  const refreshCurrentSkillFromBackend = async () => {
    if (!currentSkill?.id) return;
    
    try {
      console.log('Refrescando habilidad desde backend:', currentSkill.name);
      const allSkills = await getSkillsForLearning();
      const refreshedSkill = allSkills.find(skill => skill.id === currentSkill.id);
      
      if (refreshedSkill) {
        // Convertir la estructura de la API a SkillData
        const updatedSkill: SkillData = {
          ...currentSkill,
          whatLearned: refreshedSkill.whatLearned || []
        };
        
        console.log('Habilidad refrescada:', updatedSkill);
        setCurrentSkill(updatedSkill);
        
        // Recargar la lista de aprendizajes con los datos frescos
        const learnings: LearningWithSkill[] = (updatedSkill.whatLearned || []).map(learning => ({
          ...learning,
          skillId: updatedSkill.id!,
          skillName: updatedSkill.name
        }));
        
        setAllLearnings(learnings);
        
        // Si hay un aprendizaje seleccionado, actualizarlo con los datos frescos
        if (selectedLearning && selectedLearning.id) {
          const updatedSelectedLearning = learnings.find(l => l.id === selectedLearning.id);
          if (updatedSelectedLearning) {
            console.log('Actualizando selectedLearning con datos del backend:', updatedSelectedLearning);
            setSelectedLearning(updatedSelectedLearning);
          }
        }
      }
    } catch (error) {
      console.error('Error al refrescar habilidad:', error);
    }
  };

  // Efecto para cargar los aprendizajes de la habilidad actual
  useEffect(() => {
    if (currentSkill) {
      loadLearningsFromSkill();
    } else if (id) {
      // Si no tenemos la habilidad en el state, redirigir de vuelta a habilidades
      console.warn('No skill data provided, redirecting to skills page');
      navigate('/mi-conocimiento/habilidades');
    }
    
    // Limpiar cualquier contenido no deseado del localStorage/sessionStorage
    try {
      Object.keys(localStorage).forEach(key => {
        const value = localStorage.getItem(key);
        if (value && (value.includes('Plomero') || value.includes('Describe aquí lo que aprendiste'))) {
          console.log('Limpiando localStorage:', key);
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.log('Error limpiando localStorage:', e);
    }
  }, [currentSkill, id]);

  // Cargar aprendizajes desde la habilidad actual (sin hacer API calls)
  const loadLearningsFromSkill = () => {
    try {
      console.log('Cargando aprendizajes desde habilidad:', currentSkill?.name);
      
      if (!currentSkill || !currentSkill.id) return;

      // Convertir los aprendizajes de la habilidad al formato con contexto
      const learnings: LearningWithSkill[] = (currentSkill.whatLearned || []).map(learning => ({
        ...learning,
        skillId: currentSkill.id!,
        skillName: currentSkill.name
      }));

      setAllLearnings(learnings);
      console.log('Aprendizajes cargados:', learnings.length);
      
      // Si hay un aprendizaje seleccionado, actualizarlo con los datos frescos
      if (selectedLearning && selectedLearning.id) {
        const updatedSelectedLearning = learnings.find(l => l.id === selectedLearning.id);
        if (updatedSelectedLearning) {
          console.log('Actualizando selectedLearning con datos frescos:', updatedSelectedLearning);
          setSelectedLearning(updatedSelectedLearning);
        }
      }

      // Activar automáticamente el modo de creación
      setTimeout(() => {
        handleNuevoAprendizaje();
      }, 100);
    } catch (error) {
      console.error('Error al procesar aprendizajes:', error);
    }
  };

  // Filtrar aprendizajes
  const filteredLearnings = allLearnings.filter(learning =>
    learning.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    learning.skillName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear nuevo aprendizaje
  const handleNuevoAprendizaje = () => {
    console.log('handleNuevoAprendizaje llamado');
    
    if (!currentSkill || !currentSkill.id) {
      showNotification('No se pudo obtener la información de la habilidad', 'error');
      return;
    }

    console.log('Creando aprendizaje para habilidad:', currentSkill.name);
    
    setSelectedLearning(null);
    setIsEditing(true);
    // Forzar contenido completamente vacío
    setEditForm({
      name: '',
      description: '',
      content: '',
      skillId: currentSkill.id
    });
    
    // Forzar un re-render para asegurar que el editor esté limpio
    setTimeout(() => {
      setEditForm(prev => ({
        ...prev,
        content: ''
      }));
    }, 50);
  };

  // Guardar aprendizaje
  const handleGuardar = async () => {
    // Validar campos requeridos
    if (!editForm.name.trim()) {
      showNotification('Por favor ingresa un nombre para el aprendizaje', 'error');
      return;
    }

    if (!editForm.content.trim() || editForm.content === '<p><br></p>') {
      showNotification('Por favor escribe el contenido del aprendizaje', 'error');
      return;
    }

    if (!editForm.description.trim()) {
      showNotification('Por favor ingresa una descripción completa de la habilidad', 'error');
      return;
    }

    if (!editForm.skillId || !currentSkill) {
      showNotification('Error: No se pudo identificar la habilidad', 'error');
      return;
    }

    setSaving(true);
    try {
      if (selectedLearning && selectedLearning.id) {
        // Actualizar aprendizaje existente
        const updatedLearningData = {
          id: selectedLearning.id,
          name: editForm.name,
          description: editForm.description,
          content: editForm.content,
          dateCreated: selectedLearning.dateCreated,
          dateUpdated: new Date().toISOString()
        };
        
        console.log('Datos originales del selectedLearning:', selectedLearning);
        console.log('Datos del formulario para actualizar:', updatedLearningData);
        
        await updateLearning(selectedLearning.skillId, updatedLearningData);
        
        // Actualizar el aprendizaje seleccionado
        const updatedSelectedLearning = {
          ...selectedLearning,
          ...updatedLearningData,
          skillName: selectedLearning.skillName
        };
        console.log('Nuevo selectedLearning después de actualizar:', updatedSelectedLearning);
        console.log('Actualizando selectedLearning:', updatedSelectedLearning);
        setSelectedLearning(updatedSelectedLearning);
        
        // Actualizar la lista de aprendizajes
        setAllLearnings(prev => {
          const updated = prev.map(learning => 
            learning.id === selectedLearning.id 
              ? updatedSelectedLearning
              : learning
          );
          console.log('Lista de aprendizajes actualizada:', updated);
          return updated;
        });
        
        // Actualizar la habilidad actual
        if (currentSkill) {
          const updatedSkill = {
            ...currentSkill,
            whatLearned: (currentSkill.whatLearned || []).map(learning =>
              learning.id === selectedLearning.id
                ? updatedLearningData
                : learning
            )
          };
          setCurrentSkill(updatedSkill);
        }
        
        // Forzar recarga de los aprendizajes después de la actualización
        setTimeout(() => {
          refreshCurrentSkillFromBackend();
        }, 100);
      } else {
        // Crear nuevo aprendizaje
        const now = new Date().toISOString();
        const newLearning = await addLearningToSkill(editForm.skillId, {
          name: editForm.name,
          description: editForm.description,
          content: editForm.content,
          dateCreated: now,
          dateUpdated: now
        });

        if (currentSkill && currentSkill.id) {
          const learningWithSkill: LearningWithSkill = {
            ...newLearning,
            skillId: currentSkill.id,
            skillName: currentSkill.name
          };
          setSelectedLearning(learningWithSkill);
          
          // Actualizar la habilidad actual con el nuevo aprendizaje
          const updatedSkill = {
            ...currentSkill,
            whatLearned: [...(currentSkill.whatLearned || []), newLearning]
          };
          setCurrentSkill(updatedSkill);
          
          // Actualizar la lista de aprendizajes
          setAllLearnings(prev => [...prev, learningWithSkill]);
        }
      }

      setIsEditing(false);
      
      // Si es una actualización, refrescar los datos para asegurar sincronización
      if (selectedLearning && selectedLearning.id) {
        // Mantener el aprendizaje actualizado seleccionado
        // No limpiar el formulario para que mantenga los datos actualizados
        console.log('Aprendizaje actualizado - manteniendo selección');
      } else {
        // Solo limpiar si es un nuevo aprendizaje
        setEditForm({ name: '', description: '', content: '', skillId: currentSkill?.id || '' });
        console.log('Nuevo aprendizaje creado - limpiando formulario');
      }
      
      showNotification(
        selectedLearning && selectedLearning.id 
          ? '✅ Aprendizaje actualizado exitosamente' 
          : '✅ Aprendizaje guardado exitosamente', 
        'success'
      );
    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification('Error al guardar el aprendizaje', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancelar = () => {
    setIsEditing(false);
    if (selectedLearning) {
      setEditForm({
        name: selectedLearning.name,
        description: selectedLearning.description || '',
        content: selectedLearning.content,
        skillId: selectedLearning.skillId
      });
    }
  };

  // Eliminar aprendizaje
  const handleEliminar = async (learning: LearningWithSkill) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${learning.name}"?`)) {
      return;
    }

    try {
      if (learning.id) {
        await deleteLearning(learning.skillId, learning.id);
        
        // Actualizar la habilidad actual removiendo el aprendizaje
        if (currentSkill) {
          const updatedSkill = {
            ...currentSkill,
            whatLearned: (currentSkill.whatLearned || []).filter(l => l.id !== learning.id)
          };
          setCurrentSkill(updatedSkill);
        }
        
        // Actualizar la lista de aprendizajes
        setAllLearnings(prev => prev.filter(l => l.id !== learning.id));
        
        if (selectedLearning?.id === learning.id) {
          setSelectedLearning(null);
        }
        
        showNotification('🗑️ Aprendizaje eliminado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      showNotification('Error al eliminar el aprendizaje', 'error');
    }
  };

  // Función para manejar el completado del procesamiento AI
  const handleAIProcessingComplete = () => {
    // Esta función se llamará cuando el modal de procesamiento termine
    // El modal de procesamiento ya se cierra automáticamente en handleAIEnhancement
    console.log('🎉 Procesamiento AI completado, mostrando resultados...');
  };

  // Función para manejar la mejora con AI
  const handleAIEnhancement = async (enhancementRequest: string) => {
    if (!selectedLearning || !selectedLearning.id) {
      showNotification('No hay aprendizaje seleccionado para mejorar', 'error');
      return;
    }

    // Cerrar el modal de solicitud y mostrar el modal de procesamiento
    setIsAIModalOpen(false);
    setIsAIProcessing(true);

    try {
      console.log('🤖 Iniciando procesamiento con AI...');
      
      // Obtener la descripción de la habilidad del formulario o del aprendizaje seleccionado
      const skillDescription = editForm.description || selectedLearning.description || '';
      
      console.log('Llamando al API de mejora con AI:', {
        skillId: selectedLearning.skillId,
        learningId: selectedLearning.id,
        enhancementRequest,
        skillDescription
      });
      
      // Llamada real al servicio de AI con la descripción de la habilidad
      const aiResponse = await enhanceLearningWithAI(
        selectedLearning.skillId,
        selectedLearning.id,
        enhancementRequest,
        skillDescription
      );
      
      console.log('Respuesta completa del AI recibida:', aiResponse);
      console.log('🔍 Tipo de respuesta:', typeof aiResponse);
      console.log('🔍 Keys de la respuesta:', Object.keys(aiResponse || {}));
      
      // Investigar la estructura específica
      if (aiResponse.LearningResources) {
        console.log('✅ LearningResources encontrado:', aiResponse.LearningResources);
        console.log('🔍 lectureHTML en LearningResources:', aiResponse.LearningResources.lectureHTML);
      } else if (aiResponse.learningResources) {
        console.log('✅ learningResources (camelCase) encontrado:', aiResponse.learningResources);
        console.log('🔍 lectureHTML en learningResources:', aiResponse.learningResources.lectureHTML);
        console.log('🔍 htmlContent en learningResources:', aiResponse.learningResources.htmlContent);
        console.log('🔍 lectureHTML length:', (aiResponse.learningResources.lectureHTML || '').length);
        console.log('🔍 htmlContent length:', (aiResponse.learningResources.htmlContent || '').length);
      } else {
        console.log('❌ LearningResources no encontrado, propiedades disponibles:', Object.keys(aiResponse || {}));
      }
      
      // Guardar los datos y cerrar el modal de procesamiento
      setAiResourcesData(aiResponse);
      setIsAIProcessing(false); // Cerrar modal de procesamiento
      setIsResourcesReviewOpen(true); // Abrir modal de revisión
      
      showNotification('✨ Recursos de aprendizaje generados exitosamente', 'success');
      
    } catch (error: any) {
      console.error('Error al mejorar con AI:', error);
      const errorMessage = error.message || 'Error desconocido al procesar la mejora con AI';
      showNotification(`❌ Error: ${errorMessage}`, 'error');
      
      // Cerrar modal de procesamiento en caso de error
      setIsAIProcessing(false);
    }
  };

  // Función para aceptar los recursos seleccionados
  const handleAcceptResources = async () => {
    if (!aiResourcesData) {
      showNotification('Error: No hay datos de recursos para guardar', 'error');
      return;
    }

    // Determinar el aprendizaje objetivo:
    // 1. Si hay selectedLearning, usarlo (flujo normal de AI enhancement)
    // 2. Si hay targetLearningId, buscar por ID (más preciso)
    // 3. Si no, buscar por el searchQuery en la lista de aprendizajes (flujo de visualización)
    let targetLearning = selectedLearning;
    
    if (!targetLearning && (aiResourcesData as any).targetLearningId) {
      // Búsqueda más precisa por ID
      const foundLearning = allLearnings.find(learning => 
        learning.id === (aiResourcesData as any).targetLearningId
      );
      
      targetLearning = foundLearning || null;
      
      if (targetLearning) {
        console.log('🎯 Aprendizaje encontrado por ID:', targetLearning.name);
      }
    }
    
    if (!targetLearning && aiResourcesData.searchQuery) {
      console.log('🔍 Buscando aprendizaje con searchQuery:', aiResourcesData.searchQuery);
      console.log('🔍 Lista de aprendizajes disponibles:', allLearnings.map(l => ({ name: l.name, id: l.id })));
      
      // Múltiples estrategias de búsqueda
      const foundLearning = allLearnings.find(learning => {
        // Estrategia 1: Coincidencia exacta de nombre
        if (learning.name === aiResourcesData.searchQuery) {
          console.log('✅ Encontrado por nombre exacto:', learning.name);
          return true;
        }
        
        // Estrategia 2: searchQuery contiene el nombre del aprendizaje
        if (aiResourcesData.searchQuery.toLowerCase().includes(learning.name.toLowerCase())) {
          console.log('✅ Encontrado porque searchQuery contiene el nombre:', learning.name);
          return true;
        }
        
        // Estrategia 3: nombre del aprendizaje está contenido en searchQuery
        if (learning.name.toLowerCase().includes(aiResourcesData.searchQuery.toLowerCase())) {
          console.log('✅ Encontrado porque nombre contiene searchQuery:', learning.name);
          return true;
        }
        
        // Estrategia 4: Comparación por palabras clave
        const learningWords = learning.name.toLowerCase().split(' ');
        const queryWords = aiResourcesData.searchQuery.toLowerCase().split(' ');
        const matchingWords = learningWords.filter(word => 
          queryWords.some((qword: string) => qword.includes(word) || word.includes(qword))
        );
        
        if (matchingWords.length > 0) {
          console.log('✅ Encontrado por palabras clave:', learning.name, 'palabras coincidentes:', matchingWords);
          return true;
        }
        
        return false;
      });
      
      targetLearning = foundLearning || null;
      
      if (!targetLearning) {
        // Como último recurso, intentar encontrar por descripción
        const foundByDescription = allLearnings.find(learning => 
          learning.description && learning.description.toLowerCase().includes('variable')
        );
        
        if (foundByDescription) {
          console.log('✅ Encontrado por descripción (variables):', foundByDescription.name);
          targetLearning = foundByDescription;
        }
      }
      
      if (!targetLearning) {
        console.warn('⚠️ No se encontró aprendizaje objetivo para:', aiResourcesData.searchQuery);
        console.warn('⚠️ Intentar con el primer aprendizaje como fallback');
        
        // Como último fallback, usar el primer aprendizaje si solo hay uno
        if (allLearnings.length === 1) {
          targetLearning = allLearnings[0];
          console.log('✅ Usando único aprendizaje como fallback:', targetLearning.name);
        } else {
          showNotification('No se pudo identificar el aprendizaje para actualizar', 'error');
          return;
        }
      }
      
      console.log('🎯 Aprendizaje objetivo encontrado:', targetLearning.name);
    }
    
    if (!targetLearning || !targetLearning.id) {
      showNotification('Error: No se puede identificar el aprendizaje a actualizar', 'error');
      return;
    }

    try {
      console.log('🔍 Guardando recursos de aprendizaje como datos estructurados:', aiResourcesData);
      console.log('🔍 Estructura aiResourcesData:', {
        tipo: typeof aiResourcesData,
        keys: Object.keys(aiResourcesData || {}),
        learningResources: aiResourcesData?.learningResources,
        LearningResources: aiResourcesData?.LearningResources
      });
      
      // Verificar si el backend devolvió un error
      if (aiResourcesData.Success === false) {
        console.error('❌ Backend devolvió Success: false');
        const errorMsg = aiResourcesData.ErrorMessage || 'Error desconocido en el procesamiento de recursos';
        showNotification(`❌ Error del backend: ${errorMsg}`, 'error');
        return;
      }
      
      // Manejar diferentes estructuras de respuesta del backend
      let learningResources;
      let processedAt;
      let searchQuery;
      
      // Caso 1: Estructura con learningResources (camelCase inglés) - ESTE ES EL CASO REAL
      if (aiResourcesData.learningResources) {
        // Mapear de inglés camelCase a español PascalCase para el backend
        learningResources = {
          topicoAprendizaje: aiResourcesData.learningResources.topic || '',
          lectureHTML: aiResourcesData.learningResources.lectureHTML || aiResourcesData.learningResources.htmlContent || '',
          cursosOnline: aiResourcesData.learningResources.onlineCourses || [],
          librosRecomendados: aiResourcesData.learningResources.recommendedBooks || [],
          videosTutoriales: aiResourcesData.learningResources.videoTutorials || [],
          sitiosEducativos: aiResourcesData.learningResources.educationalWebsites || [],
          herramientasPractica: aiResourcesData.learningResources.practiceTools || [],
          certificaciones: aiResourcesData.learningResources.certifications || [],
          comunidades: aiResourcesData.learningResources.communities || [],
          rutaAprendizaje: aiResourcesData.learningResources.learningPath || [],
          palabrasClave: aiResourcesData.learningResources.keywords || [],
          resumenGeneral: aiResourcesData.learningResources.summary || ''
        };
        processedAt = aiResourcesData.processedAt || new Date().toISOString();
        searchQuery = aiResourcesData.searchQuery || '';
        console.log('✅ Usando estructura camelCase inglés, mapeando a español');
        console.log('🔍 Datos mapeados:', learningResources);
        console.log('🔍 lectureHTML en learningResources:', learningResources.lectureHTML);
        console.log('🔍 lectureHTML length:', learningResources.lectureHTML?.length || 0);
        console.log('🔍 FUENTE del lectureHTML:', {
          fromLectureHTML: aiResourcesData.learningResources.lectureHTML?.length || 0,
          fromHtmlContent: aiResourcesData.learningResources.htmlContent?.length || 0,
          usingField: aiResourcesData.learningResources.lectureHTML ? 'lectureHTML' : 'htmlContent'
        });
      }
      // Caso 2: Estructura SkillLearningSearchResult con LearningResources (del backend real) - Fallback
      else if (aiResourcesData.LearningResources) {
        learningResources = {
          // Mapear nombres en español a estructura esperada
          topicoAprendizaje: aiResourcesData.LearningResources.topicoAprendizaje || '',
          lectureHTML: aiResourcesData.LearningResources.lectureHTML || '',
          cursosOnline: aiResourcesData.LearningResources.cursosOnline || [],
          librosRecomendados: aiResourcesData.LearningResources.librosRecomendados || [],
          videosTutoriales: aiResourcesData.LearningResources.videosTutoriales || [],
          sitiosEducativos: aiResourcesData.LearningResources.sitiosEducativos || [],
          herramientasPractica: aiResourcesData.LearningResources.herramientasPractica || [],
          certificaciones: aiResourcesData.LearningResources.certificaciones || [],
          comunidades: aiResourcesData.LearningResources.comunidades || [],
          rutaAprendizaje: aiResourcesData.LearningResources.rutaAprendizaje || [],
          palabrasClave: aiResourcesData.LearningResources.palabrasClave || [],
          resumenGeneral: aiResourcesData.LearningResources.resumenGeneral || ''
        };
        processedAt = aiResourcesData.ProcessedAt || new Date().toISOString();
        searchQuery = aiResourcesData.SearchQuery || '';
        console.log('✅ Usando estructura SkillLearningSearchResult del backend (fallback)');
        console.log('🔍 Recursos mapeados:', learningResources);
        console.log('🔍 lectureHTML en learningResources:', learningResources.lectureHTML);
        console.log('🔍 lectureHTML length:', learningResources.lectureHTML?.length || 0);
      }
      // Caso 3: Respuesta directa son los learningResources
      else if (aiResourcesData.courses || aiResourcesData.books || aiResourcesData.videos || aiResourcesData.certifications) {
        learningResources = aiResourcesData;
        processedAt = new Date().toISOString();
        searchQuery = 'Recursos de AI';
        console.log('✅ Usando respuesta directa como learningResources');
      }
      else {
        console.error('❌ No se pudo identificar la estructura de learningResources');
        console.log('Propiedades disponibles:', Object.keys(aiResourcesData || {}));
        showNotification('Error: Estructura de datos no reconocida', 'error');
        return;
      }

      // Preparar los SearchResults con los datos del AI
      const searchResults: SkillLearningSearchResult = {
        learningResources: learningResources,
        processedAt: processedAt,
        searchQuery: searchQuery
      };

      console.log('✅ SearchResults preparados:', searchResults);
      console.log('🔍 lectureHTML en searchResults:', searchResults.learningResources?.lectureHTML);
      console.log('🔍 lectureHTML final length:', searchResults.learningResources?.lectureHTML?.length || 0);
      console.log('🔍 CONTENIDO COMPLETO DE lectureHTML:', JSON.stringify(searchResults.learningResources?.lectureHTML));

      console.log('Actualizando SearchResults para el aprendizaje:', {
        skillId: targetLearning.skillId,
        learningId: targetLearning.id,
        searchResults
      });

      // Usar la nueva función específica para actualizar SearchResults
      await updateLearningSearchResults(targetLearning.skillId, targetLearning.id, searchResults);

      // Actualizar el estado local
      const updatedTargetLearning: LearningWithSkill = {
        ...targetLearning,
        searchResults: searchResults,
        dateUpdated: new Date().toISOString(),
        skillName: targetLearning.skillName
      };

      // Si el aprendizaje actualizado es el mismo que está seleccionado, actualizar selectedLearning
      if (selectedLearning && selectedLearning.id === targetLearning.id) {
        setSelectedLearning(updatedTargetLearning);
        
        // Actualizar el formulario de edición si coincide
        setEditForm(prev => ({
          ...prev,
          name: updatedTargetLearning.name || '',
          description: updatedTargetLearning.description || '',
          content: updatedTargetLearning.content || '',
          skillId: updatedTargetLearning.skillId
        }));
      }
      
      // Actualizar la lista de aprendizajes
      setAllLearnings(prev => prev.map(learning => 
        learning.id === targetLearning.id 
          ? updatedTargetLearning
          : learning
      ));

      // Cerrar el modal de revisión
      setIsResourcesReviewOpen(false);
      setIsViewingAIResources(false);
      setAiResourcesData(null);
      
      showNotification('✅ Recursos de aprendizaje guardados exitosamente', 'success');

      // Refrescar los datos del backend para sincronizar
      setTimeout(() => {
        refreshCurrentSkillFromBackend();
      }, 100);

    } catch (error: any) {
      console.error('Error al guardar recursos:', error);
      showNotification(`❌ Error al guardar recursos: ${error.message}`, 'error');
    }
  };

  // Función para rechazar los recursos (no se usa actualmente)
  /*
  const handleRejectResources = () => {
    console.log('Recursos rechazados por el usuario');
    
    // Cerrar el modal de revisión
    setIsResourcesReviewOpen(false);
    setAiResourcesData(null);
    
    showNotification('❌ Recursos rechazados', 'info');
  };
  */

  // Función para mostrar los recursos AI existentes
  const handleViewAIResources = (learning: LearningWithSkill) => {
    console.log('Mostrando recursos AI para:', learning.name);
    
    if (!learning.searchResults) {
      console.warn('❌ No hay searchResults disponible');
      toast.error('No hay datos de búsqueda disponibles para este aprendizaje');
      return;
    }
    
    // Los datos reales están en searchResults.learningResources
    const searchData = learning.searchResults as any;
    
    // Verificar si hay learningResources disponibles (independientemente del valor de success)
    if (!searchData.learningResources) {
      console.warn('❌ No hay learningResources disponibles - mostrando modal vacío para demo');
      // Crear datos vacíos para mostrar el modal
      const emptyData = {
        success: true,
        searchQuery: learning.name || 'Búsqueda de prueba',
        twinId: '',
        processedAt: new Date().toISOString(),
        message: 'No hay recursos generados aún. Use el botón "Mejorar con AI" primero.',
        // Agregar información adicional para identificar el aprendizaje
        targetLearningId: learning.id,
        targetLearningName: learning.name,
        learningResources: {
          topic: learning.name || 'Sin tema',
          summary: 'No hay recursos de aprendizaje generados para este tema aún. Use la función "Mejorar con AI" para generar contenido personalizado.',
          onlineCourses: [],
          recommendedBooks: [],
          videoTutorials: [],
          learningPath: [],
          keywords: [],
          practiceTools: [],
          certifications: [],
          communities: [],
          educationalSites: []
        }
      };
      
      setAiResourcesData(emptyData);
      setIsViewingAIResources(true);
      return;
    }
    
    const learningResourcesData = searchData.learningResources as any;
    
    // Validar que learningResourcesData no sea null o undefined
    if (!learningResourcesData) {
      console.warn('❌ learningResourcesData es null o undefined');
      toast.error('No hay recursos de aprendizaje disponibles para mostrar');
      return;
    }
    
    console.log('🔍 learningResourcesData keys:', Object.keys(learningResourcesData));
    console.log('🔍 topicoAprendizaje:', learningResourcesData.topicoAprendizaje);
    console.log('🔍 resumenGeneral:', learningResourcesData.resumenGeneral);
    console.log('🔍 lectureHTML:', learningResourcesData.lectureHTML);
    console.log('🔍 lectureHTML length:', learningResourcesData.lectureHTML?.length || 0);
    
    const mappedResources = {
      topic: learningResourcesData.topicoAprendizaje || 'Sin tema',
      summary: learningResourcesData.resumenGeneral || 'Sin resumen',
      lectureHTML: learningResourcesData.lectureHTML || '',
      onlineCourses: learningResourcesData.cursosOnline || [],
      recommendedBooks: learningResourcesData.librosRecomendados || [],
      videoTutorials: learningResourcesData.videosTutoriales || [],
      learningPath: learningResourcesData.rutaAprendizaje || [],
      keywords: learningResourcesData.palabrasClave || [],
      practiceTools: learningResourcesData.herramientasPractica || [],
      certifications: learningResourcesData.certificaciones || [],
      communities: learningResourcesData.comunidades || [],
      educationalSites: learningResourcesData.sitiosEducativos || []
    };
    
    console.log('🔍 Mapped resources:', mappedResources);
    
    // Crear estructura compatible con LearningResourcesData
    const compatibleData = {
      success: true,
      searchQuery: learning.name, // Usar el nombre del aprendizaje para que handleAcceptResources lo encuentre
      twinId: '',
      processedAt: new Date().toISOString(),
      message: null,
      learningResources: mappedResources,
      // Agregar información adicional para identificar el aprendizaje
      targetLearningId: learning.id,
      targetLearningName: learning.name
    };
    
    setAiResourcesData(compatibleData);
    setIsViewingAIResources(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Notificación Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-md px-6 py-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-500 text-green-800' 
            : notification.type === 'error'
            ? 'bg-red-50 border-red-500 text-red-800'
            : 'bg-blue-50 border-blue-500 text-blue-800'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-auto hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Estilos para React Quill */}
      <style>{`
        .ql-editor {
          font-size: 14px !important;
          line-height: 1.6 !important;
          min-height: 350px !important;
        }
        .ql-toolbar {
          border-top: 1px solid #ccc !important;
          border-left: 1px solid #ccc !important;
          border-right: 1px solid #ccc !important;
        }
        .ql-container {
          border-bottom: 1px solid #ccc !important;
          border-left: 1px solid #ccc !important;
          border-right: 1px solid #ccc !important;
        }
        .quill {
          background: white;
        }
      `}</style>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header mejorado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <div className="min-w-0">
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 ${
                isEditing && selectedLearning ? 'text-orange-900' : 'text-gray-900'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    isEditing && selectedLearning 
                      ? 'bg-gradient-to-br from-orange-100 to-amber-100' 
                      : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}>
                    <FileText className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      isEditing && selectedLearning ? 'text-orange-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <span className="truncate">
                    {isEditing && selectedLearning ? `Editando: ${selectedLearning.name}` : 'Nuevo Aprendizaje'}
                  </span>
                </div>
                {/* Badge para indicar el modo */}
                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto ${
                  isEditing && selectedLearning
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {isEditing && selectedLearning ? 'EDITANDO' : 'NUEVO'}
                </div>
              </h1>
              {(currentSkill || selectedLearning) && (
                <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="truncate">para {selectedLearning?.skillName || currentSkill?.name}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={handleNuevoAprendizaje}
              className={`text-white ${
                isEditing && selectedLearning
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Crear aprendizaje</span>
              <span className="sm:hidden">Crear</span>
            </Button>
          </div>
        </div>

        {/* Layout de dos columnas */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Columna izquierda - Lista de aprendizajes (20%) */}
          <div className="xl:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="hidden sm:inline">Mis Aprendizajes</span>
                  <span className="sm:hidden">Aprendizajes</span>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-500">Cargando...</span>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-400px)] overflow-y-auto">
                    {filteredLearnings.map((learning) => (
                      <div
                        key={`${learning.skillId}-${learning.id}`}
                        className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 group ${
                          selectedLearning?.id === learning.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => {
                          console.log('Clic en aprendizaje:', learning);
                          console.log('Datos del aprendizaje seleccionado:', {
                            id: learning.id,
                            name: learning.name,
                            content: learning.content?.substring(0, 100) + '...'
                          });
                          setSelectedLearning(learning);
                          setIsEditing(true);
                          setEditForm({
                            name: learning.name,
                            description: learning.description || '',
                            content: learning.content,
                            skillId: learning.skillId
                          });
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate text-sm">
                              {learning.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Target className="w-3 h-3 text-blue-500" />
                              <p className="text-xs text-blue-600 truncate">
                                {learning.skillName}
                              </p>
                              {learning.searchResults && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>AI Recursos</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewAIResources(learning);
                                    }}
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 flex-shrink-0"
                                    title="Ver recursos de AI"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {new Date(learning.dateUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminar(learning);
                            }}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {!loading && filteredLearnings.length === 0 && (
                      <div className="p-8 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          No hay aprendizajes aún
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                          Comienza agregando tu primer aprendizaje
                        </p>
                        <Button onClick={handleNuevoAprendizaje} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Crear aprendizaje
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Editor de contenido (80%) */}
          <div className="xl:col-span-9">
            {selectedLearning || isEditing ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre del aprendizaje *
                            </label>
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="text-lg sm:text-xl font-bold"
                              placeholder="Nombre del aprendizaje"
                              required
                            />
                          </div>
                          
                          {/* Campo de descripción */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descripción completa de la habilidad *
                            </label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-sm"
                              placeholder="Describe de manera completa esta nueva habilidad: qué es, para qué sirve, cuándo usarla, etc."
                              rows={3}
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Proporciona una explicación detallada que ayude a entender completamente esta habilidad
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-xl sm:text-2xl text-gray-900 break-words">
                            {selectedLearning?.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 text-sm truncate">{selectedLearning?.skillName}</span>
                          </div>
                          {selectedLearning?.description && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 sm:p-4 mb-4">
                              <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Descripción de la habilidad</h4>
                              <p className="text-blue-800 text-sm leading-relaxed">{selectedLearning.description}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                      {isEditing ? (
                        <>
                          {/* Botón de mejora con AI - solo para modo edición */}
                          {isEditing && selectedLearning && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAIModalOpen(true)}
                              disabled={saving || isEnhancingWithAI}
                              className="flex items-center gap-2 border-2 border-purple-500 text-purple-700 hover:bg-purple-50 order-3 sm:order-1 justify-center sm:justify-start"
                            >
                              {isEnhancingWithAI ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">AI</span>
                                </div>
                              )}
                              <span className="hidden sm:inline">Mejorar con AI</span>
                              <span className="sm:hidden">Mejorar</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGuardar}
                            disabled={saving}
                            className={`flex items-center gap-2 border-2 order-1 sm:order-2 justify-center sm:justify-start ${
                              isEditing && selectedLearning
                                ? 'border-orange-500 text-orange-700 hover:bg-orange-50'
                                : 'border-green-500 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">
                              {isEditing && selectedLearning ? 'Actualizar' : 'Guardar'}
                            </span>
                            <span className="sm:hidden">
                              {isEditing && selectedLearning ? 'Actualizar' : 'Guardar'}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelar}
                            className="flex items-center gap-2 order-2 sm:order-3 justify-center sm:justify-start"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(true);
                            if (selectedLearning) {
                              setEditForm({
                                name: selectedLearning.name,
                                description: selectedLearning.description || '',
                                content: selectedLearning.content,
                                skillId: selectedLearning.skillId
                              });
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  {isEditing ? (
                    <div className="flex-1 flex flex-col">
                      {/* React Quill Editor */}
                      <div className="flex-1">
                        <ReactQuill
                          key={`quill-${isEditing}-${selectedLearning?.id || 'new'}`}
                          value={editForm.content || ''}
                          onChange={(content) => {
                            // Limpieza agresiva de contenido no deseado
                            const cleanContent = content
                              .replace(/<h2>Nuevo Aprendizaje para.*?<\/h2>/gi, '')
                              .replace(/<p>Describe aquí lo que aprendiste\.\.\.<\/p>/gi, '')
                              .replace(/Plomero/gi, '');
                            setEditForm(prev => ({ ...prev, content: cleanContent }));
                          }}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="📝 Documenta tu aprendizaje paso a paso:

1️⃣ ¿Qué problema resuelve esta habilidad?
2️⃣ ¿Cuáles son los pasos principales para aplicarla?
3️⃣ ¿Qué herramientas o recursos necesitas?
4️⃣ ¿Qué consejos o mejores prácticas has aprendido?
5️⃣ ¿Qué errores comunes hay que evitar?

💡 Incluye ejemplos prácticos y detalles específicos que te ayuden a recordar y aplicar esta habilidad en el futuro."
                          style={{ height: '400px' }}
                          theme="snow"
                          defaultValue=""
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedLearning?.content || '' }}
                      />
                      
                      {/* Sección de Recursos de AI */}
                      {selectedLearning?.searchResults && selectedLearning.searchResults.learningResources && (
                        <div className="mt-8 border-t border-gray-200 pt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Recursos de AI</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {selectedLearning.searchResults.processedAt ? 
                                new Date(selectedLearning.searchResults.processedAt).toLocaleDateString() : 
                                'Fecha no disponible'
                              }
                            </span>
                          </div>
                          
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Búsqueda:</strong> {selectedLearning.searchResults.searchQuery || 'Sin consulta registrada'}
                            </p>
                          </div>

                          {/* Mostrar mensaje si no hay recursos pero hay resumen */}
                          {(!selectedLearning.searchResults.learningResources.cursosOnline?.length &&
                            !selectedLearning.searchResults.learningResources.librosRecomendados?.length &&
                            !selectedLearning.searchResults.learningResources.videosTutoriales?.length &&
                            !selectedLearning.searchResults.learningResources.certificaciones?.length) ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                              <p className="text-sm text-yellow-800">
                                🔍 <strong>Recursos específicos no encontrados</strong> - El sistema de AI procesó tu consulta pero no encontró recursos específicos. 
                                {selectedLearning.searchResults.learningResources.resumenGeneral && 
                                  " Sin embargo, se generó un resumen general que puedes revisar más abajo."
                                }
                              </p>
                            </div>
                          ) : null}

                          {/* Cursos */}
                          {selectedLearning.searchResults.learningResources.cursosOnline && 
                           selectedLearning.searchResults.learningResources.cursosOnline.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                Cursos ({selectedLearning.searchResults.learningResources.cursosOnline.length})
                              </h4>
                              <div className="grid gap-3">
                                {selectedLearning.searchResults.learningResources.cursosOnline.map((curso: any, index: number) => (
                                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                    <h5 className="font-medium text-sm text-gray-900 mb-1">{curso.titulo}</h5>
                                    <p className="text-xs text-gray-600 mb-2">{curso.descripcion}</p>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-blue-600">{curso.plataforma}</span>
                                      <span className="text-gray-500">{curso.duracion}</span>
                                    </div>
                                    {curso.url && (
                                      <a 
                                        href={curso.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        Ver curso →
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Libros */}
                          {selectedLearning.searchResults.learningResources.librosRecomendados && 
                           selectedLearning.searchResults.learningResources.librosRecomendados.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-green-600" />
                                Libros ({selectedLearning.searchResults.learningResources.librosRecomendados.length})
                              </h4>
                              <div className="grid gap-3">
                                {selectedLearning.searchResults.learningResources.librosRecomendados.map((libro: any, index: number) => (
                                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                    <h5 className="font-medium text-sm text-gray-900 mb-1">{libro.titulo}</h5>
                                    <p className="text-xs text-gray-600 mb-2">por {libro.autor}</p>
                                    <p className="text-xs text-gray-600 mb-2">{libro.descripcion}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Videos */}
                          {selectedLearning.searchResults.learningResources.videosTutoriales && 
                           selectedLearning.searchResults.learningResources.videosTutoriales.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-red-600" />
                                Videos ({selectedLearning.searchResults.learningResources.videosTutoriales.length})
                              </h4>
                              <div className="grid gap-3">
                                {selectedLearning.searchResults.learningResources.videosTutoriales.map((video: any, index: number) => (
                                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                    <h5 className="font-medium text-sm text-gray-900 mb-1">{video.titulo}</h5>
                                    <p className="text-xs text-gray-600 mb-2">{video.descripcion}</p>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-red-600">{video.canal}</span>
                                      <span className="text-gray-500">{video.duracion}</span>
                                    </div>
                                    {video.url && (
                                      <a 
                                        href={video.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-xs text-red-600 hover:text-red-800"
                                      >
                                        Ver video →
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Certificaciones */}
                          {selectedLearning.searchResults.learningResources.certificaciones && 
                           selectedLearning.searchResults.learningResources.certificaciones.length > 0 && (
                            <div className="mb-6">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-600" />
                                Certificaciones ({selectedLearning.searchResults.learningResources.certificaciones.length})
                              </h4>
                              <div className="grid gap-3">
                                {selectedLearning.searchResults.learningResources.certificaciones.map((cert: any, index: number) => (
                                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                    <h5 className="font-medium text-sm text-gray-900 mb-1">{cert.titulo}</h5>
                                    <p className="text-xs text-gray-600 mb-2">{cert.descripcion}</p>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-purple-600">{cert.organizacion}</span>
                                      <span className="text-gray-500">{cert.nivel}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    ¡Documenta tu nuevo aprendizaje!
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Crea tu primer aprendizaje para la habilidad <strong>{currentSkill?.name}</strong>. 
                    Dale un nombre descriptivo y escribe sobre lo que aprendiste.
                  </p>
                  <Button onClick={handleNuevoAprendizaje} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Crear aprendizaje
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de mejora con AI */}
      {selectedLearning && (
        <LearningAIEnhancementModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          learningData={{
            id: selectedLearning.id,
            name: selectedLearning.name,
            description: selectedLearning.description || '',
            content: selectedLearning.content,
            skillId: selectedLearning.skillId,
            skillName: selectedLearning.skillName
          }}
          onEnhance={handleAIEnhancement}
        />
      )}

      {/* Modal de procesamiento AI */}
      <AIProcessingModal
        isOpen={isAIProcessing}
        onComplete={handleAIProcessingComplete}
        skillName={selectedLearning?.skillName || currentSkill?.name || 'Habilidad'}
        learningName={selectedLearning?.name || 'Aprendizaje'}
      />

      {/* Modal de revisión de recursos de aprendizaje */}
      <LearningResourcesReviewModal
        isOpen={isResourcesReviewOpen}
        onClose={() => setIsResourcesReviewOpen(false)}
        resourcesData={aiResourcesData}
        onConfirm={handleAcceptResources}
        isLoading={false}
        isViewOnly={false}
      />

      {/* Modal para ver recursos AI existentes */}
      <LearningResourcesReviewModal
        isOpen={isViewingAIResources}
        onClose={() => {
          setIsViewingAIResources(false);
          setAiResourcesData(null);
        }}
        resourcesData={aiResourcesData}
        onConfirm={() => {
          setIsViewingAIResources(false);
          setAiResourcesData(null);
        }}
        isLoading={false}
        isViewOnly={true}
      />
      
      {/* Toaster para notificaciones */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default NuevoAprendiPage;