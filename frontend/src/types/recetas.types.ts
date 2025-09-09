// ===== TIPOS PARA RECETAS SALUDABLES =====

// Categorías de recetas
export type CategoriaReceta = 
    | 'Desayuno' | 'Media Mañana' | 'Almuerzo' | 'Merienda' | 'Cena' 
    | 'Snack' | 'Bebida' | 'Postre' | 'Entrada' | 'Plato Principal' 
    | 'Acompañamiento' | 'Sopa' | 'Ensalada' | 'Smoothie' | 'Otro';

// Dificultad de preparación
export type DificultadReceta = 'Fácil' | 'Intermedio' | 'Difícil';

// Unidades de medida para ingredientes
export type UnidadIngrediente = 
    | 'gramos' | 'kilogramos' | 'mililitros' | 'litros' | 'tazas' 
    | 'cucharadas' | 'cucharaditas' | 'unidades' | 'rebanadas' 
    | 'porciones' | 'puñados' | 'bolas' | 'vasos' | 'onzas'
    | 'libras' | 'pizca' | 'al gusto';

// Ingrediente dentro de una receta
export interface IngredienteReceta {
    id: string;
    nombre: string;
    cantidad: number;
    unidad: UnidadIngrediente;
    calorias: number;
    esOpcional?: boolean;
    notas?: string; // ej: "cortado en cubitos", "maduro"
}

// Paso de preparación
export interface PasoPreparacion {
    numero: number;
    descripcion: string;
    tiempoEstimado?: number; // en minutos
    temperatura?: string; // ej: "180°C", "fuego medio"
    consejo?: string;
}

// Información nutricional de la receta
export interface InformacionNutricional {
    caloriasPorPorcion: number;
    caloriasTotal: number;
    proteinas?: number; // gramos por porción
    carbohidratos?: number; // gramos por porción
    grasas?: number; // gramos por porción
    fibra?: number; // gramos por porción
    azucar?: number; // gramos por porción
    sodio?: number; // miligramos por porción
}

// Receta completa
export interface Receta {
    id: string;
    nombre: string;
    descripcion: string;
    categoria: CategoriaReceta;
    dificultad: DificultadReceta;
    tiempoPreparacion: number; // en minutos
    tiempoCoccion?: number; // en minutos
    tiempoTotal: number; // en minutos
    porciones: number;
    
    ingredientes: IngredienteReceta[];
    pasos: PasoPreparacion[];
    informacionNutricional: InformacionNutricional;
    
    // Información adicional
    consejos?: string[];
    variaciones?: string[];
    origen?: string; // país o región de origen
    temporada?: string; // ej: "Verano", "Todo el año"
    etiquetas?: string[]; // ej: ["vegano", "sin gluten", "bajo en sodio"]
    
    // URLs opcionales
    imagenUrl?: string;
    videoUrl?: string;
    
    // Ratings y favoritos
    calificacion?: number; // 1-5 estrellas
    esFavorita?: boolean;
    vecesPreparada?: number;
    
    // Campos de sistema
    fechaCreacion: string;
    fechaActualizacion: string;
    creadoPor?: string; // ID del usuario
}

// ===== TIPOS PARA ALIMENTOS BASE =====

// Categorías de alimentos
export type CategoriaAlimento = 
    | 'Frutas' | 'Verduras' | 'Proteínas' | 'Lácteos' | 'Cereales' 
    | 'Legumbres' | 'Frutos Secos' | 'Aceites y Grasas' | 'Especias y Condimentos'
    | 'Dulces' | 'Bebidas' | 'Harinas' | 'Semillas' | 'Hierbas' | 'Otros';

// Alimento base con información nutricional
export interface AlimentoBase {
    id: string;
    twinID: string; // Cambiado de creadoPor a twinID para coincidir con backend
    nombreAlimento: string; // Cambiado de nombre a nombreAlimento
    categoria: string; // Cambiado de CategoriaAlimento a string para más flexibilidad
    
    // Información nutricional por 100g
    caloriasPor100g: number;
    proteinas?: number; // gramos por 100g
    carbohidratos?: number; // gramos por 100g
    grasas?: number; // gramos por 100g
    fibra?: number; // gramos por 100g
    
    // Unidad común de medida
    unidadComun: string; // Cambiado de UnidadIngrediente a string, default "unidades"
    cantidadComun: number; // default 1
    
    // Descripción opcional
    descripcion?: string;
    
    // Campos de sistema
    fechaCreacion: string;
    fechaActualizacion: string;
    type: string; // Nuevo campo, default "food"
    
    // Campos calculados localmente (no enviados al backend)
    caloriasUnidadComun?: number; // calorías de la cantidad común (calculado en frontend)
}

// ===== TIPOS PARA API REQUESTS =====

// Request para crear receta
export interface CrearRecetaRequest {
    twinId: string;
    nombre: string;
    descripcion: string;
    categoria: CategoriaReceta;
    dificultad: DificultadReceta;
    tiempoPreparacion: number;
    tiempoCoccion?: number;
    porciones: number;
    ingredientes: Omit<IngredienteReceta, 'id'>[];
    pasos: PasoPreparacion[];
    consejos?: string[];
    variaciones?: string[];
    origen?: string;
    temporada?: string;
    etiquetas?: string[];
    imagenUrl?: string;
    videoUrl?: string;
}

// Request para actualizar receta
export interface ActualizarRecetaRequest extends Partial<Omit<CrearRecetaRequest, 'ingredientes'>> {
    id: string;
    ingredientes?: IngredienteReceta[];
}

// Request para crear alimento base
export interface CrearAlimentoRequest {
    twinID: string; // Cambiado de twinId a twinID
    nombreAlimento: string; // Cambiado de nombre a nombreAlimento
    categoria: string; // Cambiado de CategoriaAlimento a string
    
    // Información nutricional por 100g
    caloriasPor100g: number;
    proteinas?: number;
    carbohidratos?: number;
    grasas?: number;
    fibra?: number;
    
    // Unidad común de medida
    unidadComun: string; // Cambiado de UnidadIngrediente a string
    cantidadComun: number;
    
    // Descripción opcional
    descripcion?: string;
}

// Request para actualizar alimento
export interface ActualizarAlimentoRequest extends Partial<CrearAlimentoRequest> {
    id: string;
}

// Filtros para búsqueda de recetas
export interface FiltrosRecetaRequest {
    twinId: string;
    categoria?: CategoriaReceta;
    dificultad?: DificultadReceta;
    tiempoMaximo?: number;
    busqueda?: string;
    etiquetas?: string[];
    soloFavoritas?: boolean;
    limite?: number;
    offset?: number;
}

// Filtros para búsqueda de alimentos
export interface FiltrosAlimentoRequest {
    twinID: string; // Cambiado de twinId a twinID
    categoria?: string; // Cambiado de CategoriaAlimento a string
    busqueda?: string;
    limite?: number;
    offset?: number;
}

// ===== TIPOS PARA API RESPONSES =====

export interface RecetaResponse {
    receta: Receta;
    mensaje: string;
    exito: boolean;
}

export interface ListaRecetasResponse {
    recetas: Receta[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
    exito: boolean;
}

export interface AlimentoResponse {
    alimento: AlimentoBase;
    mensaje: string;
    exito: boolean;
}

export interface ListaAlimentosResponse {
    alimentos: AlimentoBase[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
    exito: boolean;
}

// ===== VALIDACIONES =====
export const validacionesReceta = {
    nombre: { minLength: 3, maxLength: 100 },
    descripcion: { minLength: 10, maxLength: 500 },
    tiempoPreparacion: { min: 1, max: 1440 }, // máximo 24 horas
    tiempoCoccion: { min: 0, max: 1440 },
    porciones: { min: 1, max: 50 },
    pasos: { minItems: 1, maxItems: 50 },
    ingredientes: { minItems: 1, maxItems: 100 }
};

export const validacionesAlimento = {
    nombre: { minLength: 2, maxLength: 100 },
    caloriasPor100g: { min: 0, max: 2000 },
    cantidadComun: { min: 0.1, max: 10000 },
    nutrientes: { min: 0, max: 1000 }
};

// ===== DATOS PREDEFINIDOS =====
export const categoriasReceta: CategoriaReceta[] = [
    'Desayuno', 'Media Mañana', 'Almuerzo', 'Merienda', 'Cena', 'Snack',
    'Bebida', 'Postre', 'Entrada', 'Plato Principal', 'Acompañamiento',
    'Sopa', 'Ensalada', 'Smoothie', 'Otro'
];

export const categoriasAlimento: CategoriaAlimento[] = [
    'Frutas', 'Verduras', 'Proteínas', 'Lácteos', 'Cereales', 'Legumbres',
    'Frutos Secos', 'Aceites y Grasas', 'Especias y Condimentos', 'Dulces',
    'Bebidas', 'Harinas', 'Semillas', 'Hierbas', 'Otros'
];

export const unidadesIngrediente: UnidadIngrediente[] = [
    'gramos', 'kilogramos', 'mililitros', 'litros', 'tazas', 'cucharadas',
    'cucharaditas', 'unidades', 'rebanadas', 'porciones', 'puñados', 'bolas',
    'vasos', 'onzas', 'libras', 'pizca', 'al gusto'
];

export const etiquetasComunes: string[] = [
    'vegano', 'vegetariano', 'sin gluten', 'sin lactosa', 'bajo en sodio',
    'bajo en azúcar', 'alto en proteína', 'alto en fibra', 'bajo en grasa',
    'keto', 'paleo', 'mediterráneo', 'sin azúcar añadido', 'crudo',
    'fermentado', 'orgánico', 'local', 'económico', 'rápido', 'festivo'
];
