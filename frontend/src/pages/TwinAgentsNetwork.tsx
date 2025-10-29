import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/Logo.png';
import { 
  User, 
  Users, 
  Phone, 
  Camera, 
  FileText, 
  FileImage, 
  File, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  Star, 
  Brain, 
  Home, 
  Sofa, 
  Car,
  Laptop,
  Tv
} from 'lucide-react';

interface AgentCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  route: string;
  category?: string;
}

const TwinAgentsNetwork: React.FC = () => {
  const navigate = useNavigate();

  const agentCards: AgentCard[] = [
    // Datos Personales
    {
      id: 'personal-data',
      title: 'Datos Personales',
      description: 'Gestiona tu información personal y perfil',
      icon: <User className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
      textColor: 'text-white',
      route: '/twin-biografia/datos-personales'
    },
    
    // Mi Familia
    {
      id: 'family',
      title: 'Mi Familia',
      description: 'Información y datos de tu familia',
      icon: <Users className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-pink-500 to-pink-700',
      textColor: 'text-white',
      route: '/twin-biografia/familia'
    },
    
    // Contactos
    {
      id: 'contacts',
      title: 'Contactos',
      description: 'Gestiona tu red de contactos',
      icon: <Phone className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-700',
      textColor: 'text-white',
      route: '/twin-biografia/contactos'
    },
    
    // Fotos Familiares
    {
      id: 'family-photos',
      title: 'Fotos Familiares',
      description: 'Organiza y busca fotos de tu familia',
      icon: <Camera className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-700',
      textColor: 'text-white',
      route: '/twin-biografia/fotos'
    },
    
    // Documentos Estructurados
    {
      id: 'structured-docs',
      title: 'Documentos Estructurados',
      description: 'Archivos personales bien organizados',
      icon: <FileText className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
      textColor: 'text-white',
      route: '/twin-biografia/archivos-personales/estructurados'
    },
    
    // Documentos Semi-estructurados
    {
      id: 'semi-structured-docs',
      title: 'Documentos Semi-estructurados',
      description: 'Archivos con estructura parcial',
      icon: <FileImage className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-700',
      textColor: 'text-white',
      route: '/twin-biografia/archivos-personales/semi-estructurados'
    },
    
    // Documentos No estructurados
    {
      id: 'unstructured-docs',
      title: 'Documentos No Estructurados',
      description: 'Archivos libres y diversos formatos',
      icon: <File className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
      textColor: 'text-white',
      route: '/mis-twins'
    },
    
    // Lugar donde vivo
    {
      id: 'location',
      title: 'Lugar donde Vivo',
      description: 'Información sobre tu ubicación y hogar',
      icon: <MapPin className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-teal-500 to-teal-700',
      textColor: 'text-white',
      route: '/mis-twins'
    },
    
    // Libros (Conocimiento)
    {
      id: 'books',
      title: 'Libros',
      description: 'Tu biblioteca personal y lecturas',
      icon: <BookOpen className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-700',
      textColor: 'text-white',
      route: '/mi-conocimiento/libros',
      category: 'knowledge'
    },
    
    // Cursos (Conocimiento)
    {
      id: 'courses',
      title: 'Cursos',
      description: 'Cursos y formación académica',
      icon: <GraduationCap className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
      textColor: 'text-white',
      route: '/mi-conocimiento/cursos',
      category: 'knowledge'
    },
    
    // Mis Habilidades (Conocimiento)
    {
      id: 'skills',
      title: 'Mis Habilidades',
      description: 'Competencias y destrezas personales',
      icon: <Star className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-violet-500 to-violet-700',
      textColor: 'text-white',
      route: '/mis-twins',
      category: 'knowledge'
    },
    
    // Mis Memorias
    {
      id: 'memories',
      title: 'Mis Memorias',
      description: 'Recuerdos y experiencias personales',
      icon: <Brain className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-rose-500 to-rose-700',
      textColor: 'text-white',
      route: '/mis-twins'
    },
    
    // Mi Casa (Hogar)
    {
      id: 'house',
      title: 'Mi Casa',
      description: 'Información sobre tu hogar',
      icon: <Home className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-cyan-500 to-cyan-700',
      textColor: 'text-white',
      route: '/mi-patrimonio/casas',
      category: 'home'
    },
    
    // Muebles (Hogar)
    {
      id: 'furniture',
      title: 'Muebles',
      description: 'Inventario de muebles y decoración',
      icon: <Sofa className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-stone-500 to-stone-700',
      textColor: 'text-white',
      route: '/mis-twins',
      category: 'home'
    },
    
    // TVs (Hogar)
    {
      id: 'tvs',
      title: 'TVs',
      description: 'Televisores y dispositivos de entretenimiento',
      icon: <Tv className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-slate-500 to-slate-700',
      textColor: 'text-white',
      route: '/mis-twins',
      category: 'home'
    },
    
    // Computers (Hogar)
    {
      id: 'computers',
      title: 'Computadoras',
      description: 'Equipos informáticos y dispositivos',
      icon: <Laptop className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-gray-500 to-gray-700',
      textColor: 'text-white',
      route: '/mis-twins',
      category: 'home'
    },
    
    // Mis Vehículos
    {
      id: 'vehicles',
      title: 'Mis Vehículos',
      description: 'Gestión de vehículos y transporte',
      icon: <Car className="w-8 h-8" />,
      bgColor: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
      textColor: 'text-white',
      route: '/twin-vehiculo'
    }
  ];

  const handleCardClick = (card: AgentCard) => {
    // Navegar al agente específico pasando la información del agente
    navigate(`/twin-agent/${card.id}`, {
      state: {
        agentInfo: {
          id: card.id,
          title: card.title,
          description: card.description,
          bgColor: card.bgColor,
          textColor: card.textColor
        }
      }
    });
  };

  const getCardsByCategory = (category?: string) => {
    return agentCards.filter(card => card.category === category);
  };

  const getGeneralCards = () => {
    return agentCards.filter(card => !card.category);
  };

  const knowledgeCards = getCardsByCategory('knowledge');
  const homeCards = getCardsByCategory('home');
  const generalCards = getGeneralCards();

  const renderSection = (title: string, cards: AgentCard[]) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        {title === 'Mi Conocimiento' && <BookOpen className="w-6 h-6 mr-2" />}
        {title === 'Hogar' && <Home className="w-6 h-6 mr-2" />}
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`
              ${card.bgColor} 
              ${card.textColor}
              rounded-xl p-6 cursor-pointer transform transition-all duration-300 
              hover:scale-105 hover:shadow-2xl hover:shadow-black/20
              shadow-lg group relative overflow-hidden
            `}
          >
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {card.icon}
                </div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">
                {card.title}
              </h3>
              
              <p className="text-sm opacity-90 leading-relaxed">
                {card.description}
              </p>
              
              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={Logo} 
              alt="TwinAgent Network Logo" 
              className="w-16 h-16 mr-4 rounded-full bg-white p-2 shadow-lg"
            />
            <h1 className="text-4xl font-bold text-gray-800">
              Twin Agents Network
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Accede a tu red de agentes AI especializados para gestionar todos los aspectos de tu vida digital
          </p>
        </div>

        {/* General Cards */}
        {generalCards.length > 0 && renderSection('Agentes Principales', generalCards)}

        {/* Knowledge Section */}
        {knowledgeCards.length > 0 && renderSection('Mi Conocimiento', knowledgeCards)}

        {/* Home Section */}
        {homeCards.length > 0 && renderSection('Hogar', homeCards)}
      </div>
    </div>
  );
};

export default TwinAgentsNetwork;