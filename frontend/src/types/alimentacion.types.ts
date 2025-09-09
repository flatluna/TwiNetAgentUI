// ===== TIPOS PARA DIARIO DE ALIMENTACIÓN =====

// Categorías de alimentos
export type CategoriaAlimento = 
    | 'Frutas' | 'Verduras' | 'Proteínas' | 'Lácteos' | 'Cereales' 
    | 'Legumbres' | 'Frutos Secos' | 'Aceites y Grasas' | 'Dulces' 
    | 'Bebidas' | 'Sopas' | 'Snacks' | 'Comida Preparada' | 'Otros';

// Tipos de comida del día
export type TipoComida = 'Desayuno' | 'Media Mañana' | 'Almuerzo' | 'Merienda' | 'Cena' | 'Snack Nocturno';

// Unidades de medida
export type UnidadMedida = 
    | 'gramos' | 'kilogramos' | 'mililitros' | 'litros' | 'tazas' 
    | 'cucharadas' | 'cucharaditas' | 'unidades' | 'rebanadas' 
    | 'porciones' | 'puñados' | 'bolas' | 'vasos';

// Alimento individual con información nutricional
export interface AlimentoBase {
    id: string;
    nombre: string;
    categoria: CategoriaAlimento;
    caloriasPor100g: number;
    proteinas?: number; // gramos por 100g
    carbohidratos?: number; // gramos por 100g
    grasas?: number; // gramos por 100g
    fibra?: number; // gramos por 100g
    azucar?: number; // gramos por 100g
    sodio?: number; // miligramos por 100g
    unidadComun: UnidadMedida;
    cantidadComun: number; // ej: 1 para "1 manzana mediana"
    caloriasUnidadComun: number; // calorías de la cantidad común
}

// Entrada de comida registrada
export interface RegistroComida {
    id: string;
    fecha: string; // formato: YYYY-MM-DD
    tipoComida: TipoComida;
    alimentos: AlimentoConsumido[];
    notas?: string;
    horaComida?: string; // formato: HH:mm
    ubicacion?: string;
    estadoAnimo?: 'excelente' | 'bueno' | 'regular' | 'malo';
    nivelHambre?: number; // escala 1-10 (1=muy poco hambre, 10=mucha hambre)
    nivelSaciedad?: number; // escala 1-10 (1=no satisfecho, 10=muy satisfecho)
    fechaCreacion: string;
    fechaActualizacion: string;
}

// Alimento consumido en una comida específica
export interface AlimentoConsumido {
    alimentoId: string;
    nombreAlimento: string;
    cantidad: number;
    unidad: UnidadMedida;
    calorias: number;
    proteinas?: number;
    carbohidratos?: number;
    grasas?: number;
}

// ===== BASE DE DATOS DE ALIMENTOS PREDEFINIDOS =====
export const alimentosComunes: AlimentoBase[] = [
    // FRUTAS
    { id: 'manzana', nombre: 'Manzana', categoria: 'Frutas', caloriasPor100g: 52, proteinas: 0.3, carbohidratos: 14, grasas: 0.2, fibra: 2.4, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 95 },
    { id: 'banana', nombre: 'Banana', categoria: 'Frutas', caloriasPor100g: 89, proteinas: 1.1, carbohidratos: 23, grasas: 0.3, fibra: 2.6, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 105 },
    { id: 'naranja', nombre: 'Naranja', categoria: 'Frutas', caloriasPor100g: 47, proteinas: 0.9, carbohidratos: 12, grasas: 0.1, fibra: 2.4, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 62 },
    { id: 'pera', nombre: 'Pera', categoria: 'Frutas', caloriasPor100g: 57, proteinas: 0.4, carbohidratos: 15, grasas: 0.1, fibra: 3.1, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 102 },
    { id: 'fresa', nombre: 'Fresas', categoria: 'Frutas', caloriasPor100g: 32, proteinas: 0.7, carbohidratos: 8, grasas: 0.3, fibra: 2, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 49 },
    { id: 'uvas', nombre: 'Uvas', categoria: 'Frutas', caloriasPor100g: 69, proteinas: 0.7, carbohidratos: 16, grasas: 0.2, fibra: 0.9, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 104 },
    { id: 'sandia', nombre: 'Sandía', categoria: 'Frutas', caloriasPor100g: 30, proteinas: 0.6, carbohidratos: 8, grasas: 0.2, fibra: 0.4, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 46 },

    // VERDURAS
    { id: 'tomate', nombre: 'Tomate', categoria: 'Verduras', caloriasPor100g: 18, proteinas: 0.9, carbohidratos: 3.9, grasas: 0.2, fibra: 1.2, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 22 },
    { id: 'zanahoria', nombre: 'Zanahoria', categoria: 'Verduras', caloriasPor100g: 41, proteinas: 0.9, carbohidratos: 10, grasas: 0.2, fibra: 2.8, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 25 },
    { id: 'brocoli', nombre: 'Brócoli', categoria: 'Verduras', caloriasPor100g: 34, proteinas: 2.8, carbohidratos: 7, grasas: 0.4, fibra: 2.6, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 55 },
    { id: 'espinaca', nombre: 'Espinaca', categoria: 'Verduras', caloriasPor100g: 23, proteinas: 2.9, carbohidratos: 3.6, grasas: 0.4, fibra: 2.2, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 7 },
    { id: 'lechuga', nombre: 'Lechuga', categoria: 'Verduras', caloriasPor100g: 15, proteinas: 1.4, carbohidratos: 2.9, grasas: 0.2, fibra: 1.3, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 5 },
    { id: 'pimiento', nombre: 'Pimiento', categoria: 'Verduras', caloriasPor100g: 20, proteinas: 1, carbohidratos: 4.6, grasas: 0.2, fibra: 1.7, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 24 },

    // CEREALES Y TUBÉRCULOS
    { id: 'papa', nombre: 'Papa', categoria: 'Cereales', caloriasPor100g: 77, proteinas: 2, carbohidratos: 17, grasas: 0.1, fibra: 2.2, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 163 },
    { id: 'arroz-blanco', nombre: 'Arroz Blanco (cocido)', categoria: 'Cereales', caloriasPor100g: 130, proteinas: 2.7, carbohidratos: 28, grasas: 0.3, fibra: 0.4, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 205 },
    { id: 'pasta', nombre: 'Pasta (cocida)', categoria: 'Cereales', caloriasPor100g: 131, proteinas: 5, carbohidratos: 25, grasas: 1.1, fibra: 1.8, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 220 },
    { id: 'pan-blanco', nombre: 'Pan Blanco', categoria: 'Cereales', caloriasPor100g: 265, proteinas: 9, carbohidratos: 49, grasas: 3.2, fibra: 2.7, unidadComun: 'rebanadas', cantidadComun: 1, caloriasUnidadComun: 80 },
    { id: 'pan-integral', nombre: 'Pan Integral', categoria: 'Cereales', caloriasPor100g: 247, proteinas: 13, carbohidratos: 41, grasas: 4.2, fibra: 7, unidadComun: 'rebanadas', cantidadComun: 1, caloriasUnidadComun: 69 },

    // PROTEÍNAS
    { id: 'huevo', nombre: 'Huevo', categoria: 'Proteínas', caloriasPor100g: 155, proteinas: 13, carbohidratos: 1.1, grasas: 11, fibra: 0, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 80 },
    { id: 'pollo-pechuga', nombre: 'Pollo (pechuga cocida)', categoria: 'Proteínas', caloriasPor100g: 165, proteinas: 31, carbohidratos: 0, grasas: 3.6, fibra: 0, unidadComun: 'gramos', cantidadComun: 100, caloriasUnidadComun: 165 },
    { id: 'carne-res', nombre: 'Carne de Res (cocida)', categoria: 'Proteínas', caloriasPor100g: 250, proteinas: 26, carbohidratos: 0, grasas: 15, fibra: 0, unidadComun: 'gramos', cantidadComun: 100, caloriasUnidadComun: 250 },
    { id: 'cerdo', nombre: 'Cerdo (cocido)', categoria: 'Proteínas', caloriasPor100g: 242, proteinas: 27, carbohidratos: 0, grasas: 14, fibra: 0, unidadComun: 'gramos', cantidadComun: 100, caloriasUnidadComun: 242 },
    { id: 'salmon', nombre: 'Salmón (cocido)', categoria: 'Proteínas', caloriasPor100g: 206, proteinas: 22, carbohidratos: 0, grasas: 12, fibra: 0, unidadComun: 'gramos', cantidadComun: 100, caloriasUnidadComun: 206 },
    { id: 'atun', nombre: 'Atún (enlatado en agua)', categoria: 'Proteínas', caloriasPor100g: 132, proteinas: 30, carbohidratos: 0, grasas: 0.8, fibra: 0, unidadComun: 'gramos', cantidadComun: 100, caloriasUnidadComun: 132 },

    // LÁCTEOS
    { id: 'yogur-natural', nombre: 'Yogur Natural', categoria: 'Lácteos', caloriasPor100g: 59, proteinas: 10, carbohidratos: 3.6, grasas: 0.4, fibra: 0, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 150 },
    { id: 'leche-entera', nombre: 'Leche Entera', categoria: 'Lácteos', caloriasPor100g: 61, proteinas: 3.2, carbohidratos: 4.8, grasas: 3.3, fibra: 0, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 150 },
    { id: 'leche-descremada', nombre: 'Leche Descremada', categoria: 'Lácteos', caloriasPor100g: 34, proteinas: 3.4, carbohidratos: 5, grasas: 0.1, fibra: 0, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 83 },
    { id: 'queso-cheddar', nombre: 'Queso Cheddar', categoria: 'Lácteos', caloriasPor100g: 402, proteinas: 25, carbohidratos: 1.3, grasas: 33, fibra: 0, unidadComun: 'gramos', cantidadComun: 30, caloriasUnidadComun: 120 },
    { id: 'queso-mozzarella', nombre: 'Queso Mozzarella', categoria: 'Lácteos', caloriasPor100g: 280, proteinas: 28, carbohidratos: 2.2, grasas: 17, fibra: 0, unidadComun: 'gramos', cantidadComun: 30, caloriasUnidadComun: 85 },

    // FRUTOS SECOS
    { id: 'almendras', nombre: 'Almendras', categoria: 'Frutos Secos', caloriasPor100g: 579, proteinas: 21, carbohidratos: 22, grasas: 50, fibra: 12, unidadComun: 'gramos', cantidadComun: 28, caloriasUnidadComun: 160 },
    { id: 'mantequilla-mani', nombre: 'Mantequilla de Maní', categoria: 'Frutos Secos', caloriasPor100g: 588, proteinas: 25, carbohidratos: 20, grasas: 50, fibra: 6, unidadComun: 'cucharadas', cantidadComun: 2, caloriasUnidadComun: 190 },

    // ACEITES Y CONDIMENTOS
    { id: 'aceite-oliva', nombre: 'Aceite de Oliva', categoria: 'Aceites y Grasas', caloriasPor100g: 884, proteinas: 0, carbohidratos: 0, grasas: 100, fibra: 0, unidadComun: 'cucharadas', cantidadComun: 1, caloriasUnidadComun: 119 },
    { id: 'azucar', nombre: 'Azúcar', categoria: 'Dulces', caloriasPor100g: 387, proteinas: 0, carbohidratos: 100, grasas: 0, fibra: 0, unidadComun: 'cucharadas', cantidadComun: 1, caloriasUnidadComun: 48 },
    { id: 'miel', nombre: 'Miel', categoria: 'Dulces', caloriasPor100g: 304, proteinas: 0.3, carbohidratos: 82, grasas: 0, fibra: 0.2, unidadComun: 'cucharadas', cantidadComun: 1, caloriasUnidadComun: 64 },

    // DULCES Y SNACKS
    { id: 'chocolate-oscuro', nombre: 'Chocolate Oscuro', categoria: 'Dulces', caloriasPor100g: 546, proteinas: 8, carbohidratos: 46, grasas: 31, fibra: 11, unidadComun: 'gramos', cantidadComun: 30, caloriasUnidadComun: 170 },
    { id: 'galletas', nombre: 'Galletas (promedio)', categoria: 'Snacks', caloriasPor100g: 502, proteinas: 6, carbohidratos: 68, grasas: 22, fibra: 2, unidadComun: 'unidades', cantidadComun: 1, caloriasUnidadComun: 75 },
    { id: 'helado', nombre: 'Helado', categoria: 'Dulces', caloriasPor100g: 207, proteinas: 3.5, carbohidratos: 24, grasas: 11, fibra: 0.7, unidadComun: 'bolas', cantidadComun: 1, caloriasUnidadComun: 137 },

    // BEBIDAS
    { id: 'agua', nombre: 'Agua', categoria: 'Bebidas', caloriasPor100g: 0, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0, unidadComun: 'vasos', cantidadComun: 1, caloriasUnidadComun: 0 },
    { id: 'cafe-negro', nombre: 'Café Negro', categoria: 'Bebidas', caloriasPor100g: 2, proteinas: 0.1, carbohidratos: 0, grasas: 0, fibra: 0, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 5 },
    { id: 'te-verde', nombre: 'Té Verde', categoria: 'Bebidas', caloriasPor100g: 1, proteinas: 0, carbohidratos: 0, grasas: 0, fibra: 0, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 2 },

    // SOPAS Y COMIDAS PREPARADAS
    { id: 'sopa-pollo', nombre: 'Sopa de Pollo', categoria: 'Sopas', caloriasPor100g: 56, proteinas: 3, carbohidratos: 8, grasas: 1.4, fibra: 0.5, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 140 },
    { id: 'sopa-verduras', nombre: 'Sopa de Verduras', categoria: 'Sopas', caloriasPor100g: 48, proteinas: 2, carbohidratos: 9, grasas: 0.6, fibra: 1.5, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 120 },
    { id: 'sopa-camaron', nombre: 'Sopa de Camarón', categoria: 'Sopas', caloriasPor100g: 73, proteinas: 8, carbohidratos: 6, grasas: 2.1, fibra: 0.8, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 180 },
    { id: 'pure-papas', nombre: 'Puré de Papas', categoria: 'Comida Preparada', caloriasPor100g: 83, proteinas: 2, carbohidratos: 14, grasas: 2.3, fibra: 1.3, unidadComun: 'tazas', cantidadComun: 1, caloriasUnidadComun: 214 }
];

// ===== INTERFACES PARA API =====

// Request para crear nuevo registro de comida
export interface CrearRegistroComidaRequest {
    twinId: string;
    fecha: string;
    tipoComida: TipoComida;
    alimentos: AlimentoConsumido[];
    horaComida?: string;
    ubicacion?: string;
    estadoAnimo?: 'excelente' | 'bueno' | 'regular' | 'malo';
    nivelHambre?: number;
    nivelSaciedad?: number;
    notas?: string;
}

// Request para actualizar registro existente
export interface ActualizarRegistroComidaRequest extends Partial<CrearRegistroComidaRequest> {
    id: string;
}

// Response para registro de comida
export interface RegistroComidaResponse {
    registro: RegistroComida;
    mensaje: string;
    exito: boolean;
}

// Response para lista de registros
export interface ListaRegistrosComidaResponse {
    registros: RegistroComida[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
    exito: boolean;
}

// Estadísticas nutricionales
export interface EstadisticasNutricionalResponse {
    // ESTADÍSTICAS DIARIAS
    caloriasHoy: number;
    proteinasHoy: number;
    carbohidratosHoy: number;
    grasasHoy: number;
    fibraHoy: number;
    
    // ESTADÍSTICAS SEMANALES
    caloriasSemana: number;
    proteinasSemana: number;
    carbohidratosSemana: number;
    grasasSemana: number;
    
    // ESTADÍSTICAS MENSUALES
    caloriasMes: number;
    proteinasMes: number;
    carbohidratosMes: number;
    grasasMes: number;
    
    // PROMEDIOS
    caloriasPromedioDia: number;
    proteinasPromedioDia: number;
    
    // ALIMENTOS MÁS CONSUMIDOS
    alimentosFrecuentes: Array<{
        nombreAlimento: string;
        vecesConsumido: number;
        caloriasTotal: number;
    }>;
    
    // TENDENCIAS
    tendenciaConsumo: 'creciente' | 'estable' | 'decreciente';
    
    exito: boolean;
}

// Filtros para búsqueda de registros
export interface FiltrosRegistroComidaRequest {
    twinId: string;
    fechaInicio?: string;
    fechaFin?: string;
    tiposComida?: TipoComida[];
    categorias?: CategoriaAlimento[];
    busqueda?: string;
    limite?: number;
    offset?: number;
    ordenarPor?: 'fecha' | 'calorias' | 'fechaCreacion';
    ordenDireccion?: 'asc' | 'desc';
}

// ===== VALIDACIONES =====
export const validacionesAlimentacion = {
    cantidad: { min: 0.1, max: 10000 },
    calorias: { min: 0, max: 10000 },
    nivelHambre: { min: 1, max: 10 },
    nivelSaciedad: { min: 1, max: 10 },
    notas: { maxLength: 500 }
};

// ===== VALORES POR DEFECTO =====
export const valoresPorDefectoAlimentacion = {
    tipoComida: 'Desayuno' as TipoComida,
    estadoAnimo: 'bueno' as 'excelente' | 'bueno' | 'regular' | 'malo',
    nivelHambre: 5,
    nivelSaciedad: 5,
    activo: true,
    sincronizado: false
};
