import React, { useState, useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { twinApiService } from "@/services/twinApiService";
import GoogleMapsLoader from "@/utils/googleMapsLoader";
import { 
    Plus, 
    Edit3, 
    Trash2, 
    Phone, 
    Mail, 
    MapPin, 
    User, 
    Building, 
    Calendar,
    X,
    Save,
    UserPlus,
    Users,
    Search,
    Heart,
    Briefcase
} from "lucide-react";

interface Contact {
    contact_id: string;
    first_name: string;
    last_name: string;
    nickname?: string;
    phone_mobile?: string;
    phone_work?: string;
    phone_home?: string;
    email?: string;
    address?: string;
    company?: string;
    position?: string;
    relationship: 'familia' | 'amigo' | 'colega' | 'conocido' | 'profesional' | 'otro';
    birthday?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

interface ContactFormData {
    first_name: string;
    last_name: string;
    nickname: string;
    phone_mobile: string;
    phone_work: string;
    phone_home: string;
    email: string;
    address: string;
    company: string;
    position: string;
    relationship: 'familia' | 'amigo' | 'colega' | 'conocido' | 'profesional' | 'otro';
    birthday: string;
    notes: string;
}

const ContactosPage: React.FC = () => {
    const { accounts } = useMsal();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRelationship, setSelectedRelationship] = useState<string>('todos');
    
    // Posiciones/cargos comunes
    const commonPositions = [
        'Director General',
        'Director',
        'Gerente',
        'Subdirector',
        'Jefe de Departamento',
        'Coordinador',
        'Supervisor',
        'Desarrollador Senior',
        'Desarrollador',
        'Desarrollador Junior',
        'Analista',
        'Consultor',
        'Especialista',
        'Técnico',
        'Asistente',
        'Secretario/a',
        'Comercial',
        'Vendedor',
        'Marketing Manager',
        'Recursos Humanos',
        'Contador',
        'Administrador',
        'Recepcionista',
        'Freelancer',
        'Empresario',
        'Estudiante',
        'Jubilado',
        'Otro'
    ];

    const [formData, setFormData] = useState<ContactFormData>({
        first_name: '',
        last_name: '',
        nickname: '',
        phone_mobile: '',
        phone_work: '',
        phone_home: '',
        email: '',
        address: '',
        company: '',
        position: '',
        relationship: 'amigo',
        birthday: '',
        notes: ''
    });

    // Referencias para Google Places
    const addressInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const autocompleteServiceRef = useRef<any>(null);

    // Google Maps API Key
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBNLrJhOMz6idD0Hipk1y_iddPTWlLqREc';

    // Relaciones disponibles
    const relationships = [
        { id: 'todos', label: 'Todos los contactos', icon: Users, color: 'bg-gray-500' },
        { id: 'familia', label: 'Familia', icon: Heart, color: 'bg-red-500' },
        { id: 'amigo', label: 'Amigos', icon: Users, color: 'bg-blue-500' },
        { id: 'colega', label: 'Colegas', icon: Briefcase, color: 'bg-green-500' },
        { id: 'profesional', label: 'Profesional', icon: Building, color: 'bg-purple-500' },
        { id: 'conocido', label: 'Conocidos', icon: User, color: 'bg-yellow-500' },
        { id: 'otro', label: 'Otros', icon: User, color: 'bg-gray-500' }
    ];

    // Get Twin ID from authentication
    const getTwinId = (): string | null => {
        if (accounts && accounts.length > 0) {
            return accounts[0].localAccountId;
        }
        return null;
    };

    // Initialize Google Places
    useEffect(() => {
        const initializeGooglePlaces = async () => {
            try {
                await GoogleMapsLoader.getInstance({ apiKey: API_KEY, libraries: ["places"] }).load();
                console.log('✅ Google Maps loaded successfully');
                
                if (window.google && window.google.maps && window.google.maps.places) {
                    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
                    console.log('✅ Google Places AutocompleteService initialized');
                } else {
                    console.error('❌ Google Maps Places not available');
                }
            } catch (error) {
                console.error('❌ Error loading Google Maps:', error);
            }
        };
        
        initializeGooglePlaces();
    }, [API_KEY]);

    // Initialize autocomplete when modal opens and input is available
    useEffect(() => {
        const initializeWhenReady = () => {
            if ((showCreateModal || showEditModal) && addressInputRef.current && window.google && window.google.maps && window.google.maps.places) {
                // Clean previous autocomplete if exists
                if (autocompleteRef.current) {
                    try {
                        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
                    } catch (error) {
                        console.log('Note: Could not clear previous listeners:', error);
                    }
                    autocompleteRef.current = null;
                }
                
                // Create new autocomplete with delay to ensure DOM is ready
                setTimeout(() => {
                    initializeAddressAutocomplete();
                }, 100);
            }
        };

        if (showCreateModal || showEditModal) {
            if (!window.google) {
                const checkGoogle = setInterval(() => {
                    if (window.google) {
                        clearInterval(checkGoogle);
                        initializeWhenReady();
                    }
                }, 500);
                
                setTimeout(() => {
                    clearInterval(checkGoogle);
                    if (!window.google) {
                        console.error('❌ Google Maps failed to load after 10 seconds');
                    }
                }, 10000);
            } else {
                initializeWhenReady();
            }
        }
    }, [showCreateModal, showEditModal]);

    const initializeAddressAutocomplete = () => {
        if (!addressInputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
            console.error('❌ Prerequisites not met for autocomplete initialization');
            return;
        }
        
        try {
            console.log('🔄 Initializing Google Places Autocomplete...');
            
            autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['address'],
                componentRestrictions: {}
            });
            
            console.log('✅ Google Places Autocomplete created');
            
            autocompleteRef.current.addListener('place_changed', () => {
                console.log('📍 Place changed event triggered');
                const place = autocompleteRef.current.getPlace();
                
                if (place && place.formatted_address) {
                    console.log('📍 Place details:', place);
                    
                    setFormData(prev => ({
                        ...prev,
                        address: place.formatted_address
                    }));
                } else {
                    console.log('❌ No address found in place');
                }
            });
            
            console.log('✅ Google Places Autocomplete fully initialized');
            
        } catch (error) {
            console.error('❌ Error initializing autocomplete:', error);
        }
    };

    // Load contacts on component mount
    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        setIsLoading(true);
        try {
            const response = await twinApiService.getContacts(twinId);
            if (response.success && response.data) {
                setContacts(response.data);
            } else {
                console.error('Error loading contacts:', response.error);
                // Fall back to mock data for development
                setContacts([
                    {
                        contact_id: '1',
                        first_name: 'María',
                        last_name: 'García',
                        nickname: 'Mari',
                        phone_mobile: '+34 666 123 456',
                        phone_work: '+34 91 234 5678',
                        email: 'maria.garcia@email.com',
                        address: 'Calle Mayor 123, Madrid',
                        company: 'Tech Solutions',
                        position: 'Desarrolladora',
                        relationship: 'amigo',
                        birthday: '1990-05-15',
                        notes: 'Compañera de universidad, muy buena programadora',
                        created_at: '2024-01-15T10:00:00Z'
                    },
                    {
                        contact_id: '2',
                        first_name: 'Carlos',
                        last_name: 'Rodríguez',
                        phone_mobile: '+34 677 987 654',
                        phone_work: '+34 91 987 6543',
                        email: 'carlos.rodriguez@empresa.com',
                        company: 'Consultora ABC',
                        position: 'Director',
                        relationship: 'colega',
                        notes: 'Cliente importante, proyectos de software',
                        created_at: '2024-02-10T14:30:00Z'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
            // Fall back to mock data on error
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateContact = async () => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        setIsLoading(true);
        try {
            const response = await twinApiService.createContact(twinId, formData);
            if (response.success && response.data) {
                setContacts([...contacts, response.data]);
                resetForm();
                setShowCreateModal(false);
            } else {
                console.error('Error creating contact:', response.error);
                // Fall back to mock creation for development
                const newContact: Contact = {
                    contact_id: Date.now().toString(),
                    ...formData,
                    created_at: new Date().toISOString()
                };
                
                setContacts([...contacts, newContact]);
                resetForm();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Error creating contact:', error);
            // Fall back to mock creation on error
            const newContact: Contact = {
                contact_id: Date.now().toString(),
                ...formData,
                created_at: new Date().toISOString()
            };
            
            setContacts([...contacts, newContact]);
            resetForm();
            setShowCreateModal(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateContact = async () => {
        if (!editingContact) return;
        
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        setIsLoading(true);
        try {
            const response = await twinApiService.updateContact(twinId, editingContact.contact_id, formData);
            if (response.success && response.data) {
                setContacts(contacts.map(c => c.contact_id === editingContact.contact_id ? response.data! : c));
                resetForm();
                setShowEditModal(false);
                setEditingContact(null);
            } else {
                console.error('Error updating contact:', response.error);
                // Fall back to mock update for development
                const updatedContact: Contact = {
                    ...editingContact,
                    ...formData,
                    updated_at: new Date().toISOString()
                };
                
                setContacts(contacts.map(c => c.contact_id === editingContact.contact_id ? updatedContact : c));
                resetForm();
                setShowEditModal(false);
                setEditingContact(null);
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            // Fall back to mock update on error
            const updatedContact: Contact = {
                ...editingContact,
                ...formData,
                updated_at: new Date().toISOString()
            };
            
            setContacts(contacts.map(c => c.contact_id === editingContact.contact_id ? updatedContact : c));
            resetForm();
            setShowEditModal(false);
            setEditingContact(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        setDeletingContactId(contactId);
        try {
            const response = await twinApiService.deleteContact(twinId, contactId);
            if (response.success) {
                setContacts(contacts.filter(c => c.contact_id !== contactId));
            } else {
                console.error('Error deleting contact:', response.error);
                // Fall back to mock deletion for development
                setContacts(contacts.filter(c => c.contact_id !== contactId));
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            // Fall back to mock deletion on error
            setContacts(contacts.filter(c => c.contact_id !== contactId));
        } finally {
            setDeletingContactId(null);
        }
    };

    const openEditModal = (contact: Contact) => {
        setEditingContact(contact);
        setFormData({
            first_name: contact.first_name,
            last_name: contact.last_name,
            nickname: contact.nickname || '',
            phone_mobile: contact.phone_mobile || '',
            phone_work: contact.phone_work || '',
            phone_home: contact.phone_home || '',
            email: contact.email || '',
            address: contact.address || '',
            company: contact.company || '',
            position: contact.position || '',
            relationship: contact.relationship,
            birthday: contact.birthday || '',
            notes: contact.notes || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            nickname: '',
            phone_mobile: '',
            phone_work: '',
            phone_home: '',
            email: '',
            address: '',
            company: '',
            position: '',
            relationship: 'amigo',
            birthday: '',
            notes: ''
        });
    };

    // Filter contacts based on search and relationship
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = searchTerm === '' || 
            contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.nickname && contact.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRelationship = selectedRelationship === 'todos' || contact.relationship === selectedRelationship;
        
        return matchesSearch && matchesRelationship;
    });

    // Get relationship display info
    const getRelationshipInfo = (relationship: string) => {
        return relationships.find(r => r.id === relationship) || relationships[relationships.length - 1];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Contactos</h1>
                            <p className="text-gray-600 mt-1">Gestiona tu red de contactos personales y profesionales</p>
                        </div>
                        <Button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="mr-2" size={16} />
                            Nuevo Contacto
                        </Button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-blue-100">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {contacts.length}
                                </h3>
                                <p className="text-sm text-gray-600">Total Contactos</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-red-100">
                                <Heart className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {contacts.filter(c => c.relationship === 'familia').length}
                                </h3>
                                <p className="text-sm text-gray-600">Familia</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-green-100">
                                <Briefcase className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {contacts.filter(c => c.relationship === 'colega' || c.relationship === 'profesional').length}
                                </h3>
                                <p className="text-sm text-gray-600">Profesionales</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-yellow-100">
                                <Calendar className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {contacts.filter(c => c.birthday).length}
                                </h3>
                                <p className="text-sm text-gray-600">Con Cumpleaños</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Búsqueda */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar contactos por nombre, email, empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filtro por relación */}
                        <div className="md:w-64">
                            <select
                                value={selectedRelationship}
                                onChange={(e) => setSelectedRelationship(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {relationships.map(rel => (
                                    <option key={rel.id} value={rel.id}>
                                        {rel.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grid de contactos */}
                {filteredContacts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="text-6xl mb-4">👥</div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            {contacts.length === 0 ? 'No tienes contactos aún' : 'No hay contactos que coincidan con los filtros'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {contacts.length === 0 
                                ? 'Comienza agregando tus primeros contactos para gestionar tu red personal y profesional'
                                : 'Prueba ajustando los filtros de búsqueda o relación'
                            }
                        </p>
                        {contacts.length === 0 && (
                            <Button 
                                onClick={() => setShowCreateModal(true)}
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <UserPlus className="mr-2" size={16} />
                                Agregar Primer Contacto
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredContacts.map(contact => {
                            const relationshipInfo = getRelationshipInfo(contact.relationship);
                            
                            return (
                                <div key={contact.contact_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* Header con avatar y relación */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                    {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="font-semibold text-gray-800 text-lg">
                                                        {contact.first_name} {contact.last_name}
                                                    </h3>
                                                    {contact.nickname && (
                                                        <p className="text-sm text-gray-500">"{contact.nickname}"</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${relationshipInfo.color}`}>
                                                {relationshipInfo.label}
                                            </span>
                                        </div>

                                        {/* Información de contacto */}
                                        <div className="space-y-2 mb-4">
                                            {contact.phone_mobile && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone size={14} className="mr-2 text-gray-400" />
                                                    <span>📱 {contact.phone_mobile}</span>
                                                </div>
                                            )}
                                            
                                            {contact.phone_work && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone size={14} className="mr-2 text-gray-400" />
                                                    <span>🏢 {contact.phone_work}</span>
                                                </div>
                                            )}
                                            
                                            {contact.phone_home && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone size={14} className="mr-2 text-gray-400" />
                                                    <span>🏠 {contact.phone_home}</span>
                                                </div>
                                            )}
                                            
                                            {contact.email && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Mail size={14} className="mr-2 text-gray-400" />
                                                    <span className="truncate">{contact.email}</span>
                                                </div>
                                            )}
                                            
                                            {contact.company && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Building size={14} className="mr-2 text-gray-400" />
                                                    <span className="truncate">
                                                        {contact.position ? `${contact.position} en ${contact.company}` : contact.company}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {contact.address && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <MapPin size={14} className="mr-2 text-gray-400" />
                                                    <span className="truncate">{contact.address}</span>
                                                </div>
                                            )}

                                            {contact.birthday && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                                    <span>{new Date(contact.birthday).toLocaleDateString('es-ES', { 
                                                        day: 'numeric', 
                                                        month: 'long'
                                                    })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Notas */}
                                        {contact.notes && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 italic">
                                                    "{contact.notes.length > 80 ? contact.notes.substring(0, 80) + '...' : contact.notes}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Acciones */}
                                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                                            <Button
                                                onClick={() => openEditModal(contact)}
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Edit3 size={14} className="mr-1" />
                                                Editar
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteContact(contact.contact_id)}
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                disabled={deletingContactId === contact.contact_id}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal para crear contacto */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Nuevo Contacto</h2>
                                    <button 
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form className="space-y-4">
                                    {/* Información básica */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nombre *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nombre"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Apellido *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Apellido"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Apodo/Alias</label>
                                        <input
                                            type="text"
                                            value={formData.nickname}
                                            onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Como le dices normalmente"
                                        />
                                    </div>

                                    {/* Información de contacto */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 666 123 456"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="email@ejemplo.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dirección</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Calle, Ciudad, País"
                                        />
                                    </div>

                                    {/* Información profesional */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Empresa</label>
                                            <input
                                                type="text"
                                                value={formData.company}
                                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nombre de la empresa"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Cargo/Posición</label>
                                            <input
                                                type="text"
                                                value={formData.position}
                                                onChange={(e) => setFormData({...formData, position: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Director, Desarrollador, etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Relación y cumpleaños */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Relación *</label>
                                            <select
                                                required
                                                value={formData.relationship}
                                                onChange={(e) => setFormData({...formData, relationship: e.target.value as any})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {relationships.slice(1).map(rel => (
                                                    <option key={rel.id} value={rel.id}>
                                                        {rel.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Cumpleaños</label>
                                            <input
                                                type="date"
                                                value={formData.birthday}
                                                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Notas */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Notas</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Información adicional, cómo conociste a esta persona, etc."
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetForm();
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleCreateContact}
                                            disabled={isLoading || !formData.first_name.trim() || !formData.last_name.trim()}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2" size={16} />
                                                    Guardar Contacto
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal para editar contacto */}
                {showEditModal && editingContact && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Editar Contacto</h2>
                                    <button 
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingContact(null);
                                            resetForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Same form as create modal but for editing */}
                                <form className="space-y-4">
                                    {/* Información básica */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nombre *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nombre"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Apellido *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Apellido"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Apodo/Alias</label>
                                        <input
                                            type="text"
                                            value={formData.nickname}
                                            onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Como le dices normalmente"
                                        />
                                    </div>

                                    {/* Información de contacto */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 666 123 456"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="email@ejemplo.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dirección</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Calle, Ciudad, País"
                                        />
                                    </div>

                                    {/* Información profesional */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Empresa</label>
                                            <input
                                                type="text"
                                                value={formData.company}
                                                onChange={(e) => setFormData({...formData, company: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Nombre de la empresa"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Cargo/Posición</label>
                                            <input
                                                type="text"
                                                value={formData.position}
                                                onChange={(e) => setFormData({...formData, position: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Director, Desarrollador, etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Relación y cumpleaños */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Relación *</label>
                                            <select
                                                required
                                                value={formData.relationship}
                                                onChange={(e) => setFormData({...formData, relationship: e.target.value as any})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {relationships.slice(1).map(rel => (
                                                    <option key={rel.id} value={rel.id}>
                                                        {rel.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Cumpleaños</label>
                                            <input
                                                type="date"
                                                value={formData.birthday}
                                                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Notas */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Notas</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Información adicional, cómo conociste a esta persona, etc."
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setEditingContact(null);
                                                resetForm();
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleUpdateContact}
                                            disabled={isLoading || !formData.first_name.trim() || !formData.last_name.trim()}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Actualizando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2" size={16} />
                                                    Actualizar Contacto
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactosPage;
