export interface IndexAI {
  IndexNumero?: string;
  Titulo?: string;
  Pagina?: number;
}

export interface PreguntaQuizAI {
  Pregunta?: string;
  Opciones?: string[];
  RespuestaCorrecta?: string;
  Explicacion?: string;
}

export interface CapituloCreadoAI {
  Titulo?: string;
  Objetivos?: string[];
  Contenido?: string;
  Ejemplos?: string[];
  Resumen?: string;
  Pagina?: number;
  Quizes?: PreguntaQuizAI[];
}

export interface CursoCreadoAI {
  Indice?: IndexAI[];
  NombreClase?: string;
  Descripcion?: string;
  Capitulos?: CapituloCreadoAI[];
  DuracionEstimada?: string;
  Etiquetas?: string[];
  TwinID?: string;
  id?: string;
}
