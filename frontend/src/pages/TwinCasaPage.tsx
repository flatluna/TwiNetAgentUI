import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
    Home,
    Plus,
    Sofa,
    Tv,
    ChefHat,
    Car,
    Lightbulb,
    Shirt,
    Book,
    Package,
    Star,
    DollarSign,
    Eye,
    ArrowRight,
    Building,
    Utensils,
    Monitor,
    Zap,
    Wrench
} from "lucide-react";

interface CategoriaPatrimonio {
    id: string;
    nombre: string;
    descripcion: string;
    icon: any;
    color: string;
    gradiente: string;
    ruta: string;
    totalItems: number;
    valorEstimado: number;
    subcategorias: string[];
}

const TwinCasaPage: React.FC = () => {
    const navigate = useNavigate();

    // Categorías principales del patrimonio del hogar
    const categoriasPatrimonio: CategoriaPatrimonio[] = [
        {
            id: 'casa',
            nombre: 'Casa',
            descripcion: 'Propiedades inmobiliarias, departamentos, casas',
            icon: Building,
            color: 'text-blue-600',
            gradiente: 'from-blue-50 to-blue-100',
            ruta: '/twin-casa/casa',
            totalItems: 2,
            valorEstimado: 450000,
            subcategorias: ['Casa principal', 'Casa de campo', 'Departamento', 'Terreno', 'Local comercial']
        },
        {
            id: 'muebles',
            nombre: 'Muebles',
            descripcion: 'Mobiliario de cocina, sala, comedor, recámaras',
            icon: Sofa,
            color: 'text-amber-600',
            gradiente: 'from-amber-50 to-amber-100',
            ruta: '/twin-casa/muebles',
            totalItems: 15,
            valorEstimado: 8500,
            subcategorias: ['Sala', 'Comedor', 'Cocina', 'Recámaras', 'Oficina', 'Baño']
        },
        {
            id: 'electrodomesticos',
            nombre: 'Electrodomésticos',
            descripcion: 'Refrigerador, lavadora, microondas, etc.',
            icon: ChefHat,
            color: 'text-green-600',
            gradiente: 'from-green-50 to-green-100',
            ruta: '/twin-casa/electrodomesticos',
            totalItems: 8,
            valorEstimado: 12000,
            subcategorias: ['Cocina', 'Lavandería', 'Climatización', 'Limpieza']
        },
        {
            id: 'televisores-audio',
            nombre: 'TVs y Audio',
            descripcion: 'Televisores, equipos de sonido, streaming',
            icon: Tv,
            color: 'text-purple-600',
            gradiente: 'from-purple-50 to-purple-100',
            ruta: '/twin-casa/tvs-audio',
            totalItems: 6,
            valorEstimado: 4200,
            subcategorias: ['Televisores', 'Audio', 'Gaming', 'Streaming']
        },
        {
            id: 'tecnologia',
            nombre: 'Tecnología',
            descripcion: 'Computadoras, tablets, smartphones, gadgets',
            icon: Monitor,
            color: 'text-indigo-600',
            gradiente: 'from-indigo-50 to-indigo-100',
            ruta: '/twin-casa/tecnologia',
            totalItems: 12,
            valorEstimado: 8900,
            subcategorias: ['Computadoras', 'Móviles', 'Tablets', 'Accesorios', 'Smart Home']
        },
        {
            id: 'vehiculos',
            nombre: 'Vehículos',
            descripcion: 'Autos, motos, bicicletas, transporte',
            icon: Car,
            color: 'text-red-600',
            gradiente: 'from-red-50 to-red-100',
            ruta: '/twin-casa/vehiculos',
            totalItems: 3,
            valorEstimado: 25000,
            subcategorias: ['Automóviles', 'Motocicletas', 'Bicicletas', 'Otros vehículos']
        },
        {
            id: 'iluminacion',
            nombre: 'Iluminación',
            descripcion: 'Lámparas, focos, sistemas de iluminación',
            icon: Lightbulb,
            color: 'text-yellow-600',
            gradiente: 'from-yellow-50 to-yellow-100',
            ruta: '/twin-casa/iluminacion',
            totalItems: 10,
            valorEstimado: 1200,
            subcategorias: ['Interior', 'Exterior', 'Decorativa', 'Funcional']
        },
        {
            id: 'electronica',
            nombre: 'Electrónica',
            descripcion: 'Dispositivos electrónicos, gadgets, accesorios',
            icon: Zap,
            color: 'text-cyan-600',
            gradiente: 'from-cyan-50 to-cyan-100',
            ruta: '/twin-casa/electronica',
            totalItems: 20,
            valorEstimado: 3400,
            subcategorias: ['Pequeños electrodomésticos', 'Cargadores', 'Cables', 'Herramientas eléctricas']
        },
        {
            id: 'herramientas',
            nombre: 'Herramientas',
            descripcion: 'Herramientas de trabajo, jardinería, reparaciones',
            icon: Wrench,
            color: 'text-gray-600',
            gradiente: 'from-gray-50 to-gray-100',
            ruta: '/twin-casa/herramientas',
            totalItems: 25,
            valorEstimado: 1800,
            subcategorias: ['Manuales', 'Eléctricas', 'Jardinería', 'Automotriz']
        },
        {
            id: 'ropa-accesorios',
            nombre: 'Ropa y Accesorios',
            descripcion: 'Vestimenta, calzado, joyas, complementos',
            icon: Shirt,
            color: 'text-pink-600',
            gradiente: 'from-pink-50 to-pink-100',
            ruta: '/twin-casa/ropa',
            totalItems: 150,
            valorEstimado: 5600,
            subcategorias: ['Ropa', 'Calzado', 'Accesorios', 'Joyas', 'Relojes']
        },
        {
            id: 'cocina-utensilios',
            nombre: 'Utensilios Cocina',
            descripcion: 'Vajillas, ollas, cubiertos, cristalería',
            icon: Utensils,
            color: 'text-orange-600',
            gradiente: 'from-orange-50 to-orange-100',
            ruta: '/twin-casa/cocina',
            totalItems: 45,
            valorEstimado: 2100,
            subcategorias: ['Vajillas', 'Ollas y sartenes', 'Cubiertos', 'Cristalería', 'Utensilios']
        },
        {
            id: 'libros-medios',
            nombre: 'Libros y Medios',
            descripcion: 'Libros, DVDs, CDs, colecciones',
            icon: Book,
            color: 'text-emerald-600',
            gradiente: 'from-emerald-50 to-emerald-100',
            ruta: '/twin-casa/libros',
            totalItems: 80,
            valorEstimado: 900,
            subcategorias: ['Libros', 'DVDs', 'CDs', 'Revistas', 'Colecciones']
        }
    ];

    // Calcular estadísticas totales
    const totalItems = categoriasPatrimonio.reduce((sum, cat) => sum + cat.totalItems, 0);
    const valorTotal = categoriasPatrimonio.reduce((sum, cat) => sum + cat.valorEstimado, 0);

    const manejarClickCategoria = (categoria: CategoriaPatrimonio) => {
        console.log(`Navegando a ${categoria.nombre}: ${categoria.ruta}`);
        
        // Navegación especial para Casa -> ir a la página dedicada de casas
        if (categoria.id === 'casa') {
            navigate('/mi-patrimonio/casas');
        } else {
            // Para otras categorías, usar la ruta definida
            navigate(categoria.ruta);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white p-3 rounded-xl shadow-lg">
                            <Home className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">🏠 Twin del Hogar</h1>
                            <p className="text-gray-600">Gestiona todo el patrimonio y objetos de tu hogar</p>
                        </div>
                    </div>
                </div>

                {/* Estadísticas generales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total de Items</p>
                                <p className="text-3xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
                            </div>
                            <Package className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Valor Estimado Total</p>
                                <p className="text-3xl font-bold text-green-600">
                                    ${valorTotal.toLocaleString()}
                                </p>
                            </div>
                            <DollarSign className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Categorías</p>
                                <p className="text-3xl font-bold text-purple-600">{categoriasPatrimonio.length}</p>
                            </div>
                            <Star className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Grid de categorías principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoriasPatrimonio.map(categoria => {
                        const IconoCategoria = categoria.icon;
                        return (
                            <div 
                                key={categoria.id} 
                                className={`bg-gradient-to-br ${categoria.gradiente} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
                                onClick={() => manejarClickCategoria(categoria)}
                            >
                                <div className="p-6">
                                    {/* Icono y título */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 bg-white rounded-xl shadow-sm`}>
                                            <IconoCategoria className={`w-8 h-8 ${categoria.color}`} />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {categoria.nombre}
                                    </h3>
                                    
                                    <p className="text-gray-600 text-sm mb-4">
                                        {categoria.descripcion}
                                    </p>

                                    {/* Estadísticas */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Items</p>
                                            <p className="text-lg font-bold text-gray-800">
                                                {categoria.totalItems}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Valor estimado</p>
                                            <p className="text-lg font-bold text-green-600">
                                                ${categoria.valorEstimado.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Subcategorías preview */}
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 mb-2">Subcategorías:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {categoria.subcategorias.slice(0, 3).map((sub, index) => (
                                                <span 
                                                    key={index}
                                                    className="px-2 py-1 bg-white bg-opacity-60 rounded-full text-xs text-gray-600"
                                                >
                                                    {sub}
                                                </span>
                                            ))}
                                            {categoria.subcategorias.length > 3 && (
                                                <span className="px-2 py-1 bg-white bg-opacity-60 rounded-full text-xs text-gray-500">
                                                    +{categoria.subcategorias.length - 3} más
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botón de acción */}
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full bg-white bg-opacity-80 hover:bg-opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                manejarClickCategoria(categoria);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Gestionar {categoria.nombre}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Información adicional */}
                <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            💡 Sobre Twin del Hogar
                        </h2>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            Cada categoría tiene su propio sistema de gestión especializado. Haz clic en cualquier categoría 
                            para acceder a su CRUD específico donde podrás agregar, editar, ver y eliminar items de esa categoría.
                            Cada tipo de objeto tiene campos y características únicas adaptadas a sus necesidades.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="text-center">
                                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                    <Plus className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">Agregar Items</h3>
                                <p className="text-sm text-gray-600">Registra todos tus objetos con información detallada</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                    <Star className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">Valorizar</h3>
                                <p className="text-sm text-gray-600">Mantén actualizado el valor de tus pertenencias</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">Organizar</h3>
                                <p className="text-sm text-gray-600">Encuentra rápidamente cualquier objeto de tu hogar</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwinCasaPage;
