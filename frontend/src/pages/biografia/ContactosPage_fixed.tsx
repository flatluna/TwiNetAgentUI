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
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
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

    // Handle create contact
    const handleCreateContact = async () => {
        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            alert('Nombre y apellido son obligatorios');
            return;
        }

        setIsLoading(true);
        try {
            const response = await twinApiService.createContact(twinId, formData);
            if (response.success && response.data) {
                setContacts(prev => [...prev, response.data]);
                setShowCreateModal(false);
                resetForm();
                console.log('Contact created successfully');
            } else {
                console.error('Error creating contact:', response.error);
                alert('Error al crear el contacto: ' + (response.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error creating contact:', error);
            alert('Error al crear el contacto. Por favor, inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
            setShowCreateModal(false);
        }
    };

    // Handle edit contact
    const handleEditContact = (contact: Contact) => {
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

    // Handle update contact
    const handleUpdateContact = async () => {
        if (!editingContact) return;

        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            alert('Nombre y apellido son obligatorios');
            return;
        }

        setIsLoading(true);
        try {
            const response = await twinApiService.updateContact(twinId, editingContact.contact_id, formData);
            if (response.success && response.data) {
                setContacts(prev => prev.map(c => 
                    c.contact_id === editingContact.contact_id ? response.data : c
                ));
                setShowEditModal(false);
                setEditingContact(null);
                resetForm();
                console.log('Contact updated successfully');
            } else {
                console.error('Error updating contact:', response.error);
                alert('Error al actualizar el contacto: ' + (response.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error updating contact:', error);
            alert('Error al actualizar el contacto. Por favor, inténtelo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete contact
    const handleDeleteContact = async (contactId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
            return;
        }

        const twinId = getTwinId();
        if (!twinId) {
            console.error('No Twin ID found');
            return;
        }

        setDeletingContactId(contactId);
        try {
            const response = await twinApiService.deleteContact(twinId, contactId);
            if (response.success) {
                setContacts(prev => prev.filter(c => c.contact_id !== contactId));
                console.log('Contact deleted successfully');
            } else {
                console.error('Error deleting contact:', response.error);
                alert('Error al eliminar el contacto: ' + (response.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Error al eliminar el contacto. Por favor, inténtelo de nuevo.');
        } finally {
            setDeletingContactId(null);
        }
    };

    // Filter contacts
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = 
            contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.nickname && contact.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRelationship = selectedRelationship === 'todos' || contact.relationship === selectedRelationship;
        
        return matchesSearch && matchesRelationship;
    });

    // Get contact display name
    const getContactDisplayName = (contact: Contact) => {
        if (contact.nickname) {
            return `${contact.first_name} "${contact.nickname}" ${contact.last_name}`;
        }
        return `${contact.first_name} ${contact.last_name}`;
    };

    // Get avatar initials
    const getAvatarInitials = (contact: Contact) => {
        return `${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`.toUpperCase();
    };

    // Get relationship info
    const getRelationshipInfo = (relationship: string) => {
        return relationships.find(r => r.id === relationship) || relationships[0];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Contactos</h1>
                    <p className="text-gray-600">Administra tu lista de contactos personales y profesionales</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar contactos por nombre, email, empresa..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Add Contact Button */}
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 px-6"
                        >
                            <Plus className="mr-2" size={20} />
                            Nuevo Contacto
                        </Button>
                    </div>

                    {/* Relationship Filters */}
                    <div className="flex flex-wrap gap-2">
                        {relationships.map(relationship => {
                            const isSelected = selectedRelationship === relationship.id;
                            const Icon = relationship.icon;
                            const contactCount = relationship.id === 'todos' 
                                ? contacts.length 
                                : contacts.filter(c => c.relationship === relationship.id).length;

                            return (
                                <button
                                    key={relationship.id}
                                    onClick={() => setSelectedRelationship(relationship.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                        isSelected
                                            ? `${relationship.color} text-white border-transparent`
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span className="text-sm font-medium">{relationship.label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        isSelected ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                        {contactCount}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Contacts Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Cargando contactos...</span>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-12">
                        <UserPlus className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchTerm || selectedRelationship !== 'todos' 
                                ? 'No se encontraron contactos' 
                                : 'No tienes contactos aún'
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || selectedRelationship !== 'todos'
                                ? 'Intenta cambiar los filtros de búsqueda'
                                : 'Comienza agregando tu primer contacto'
                            }
                        </p>
                        {(!searchTerm && selectedRelationship === 'todos') && (
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="mr-2" size={20} />
                                Crear Primer Contacto
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContacts.map(contact => {
                            const relationshipInfo = getRelationshipInfo(contact.relationship);
                            const RelationIcon = relationshipInfo.icon;
                            
                            return (
                                <div key={contact.contact_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    {/* Contact Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {getAvatarInitials(contact)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">
                                                    {getContactDisplayName(contact)}
                                                </h3>
                                                {/* Relationship Badge */}
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${relationshipInfo.color} text-white`}>
                                                    <RelationIcon size={12} />
                                                    {relationshipInfo.label}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEditContact(contact)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar contacto"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteContact(contact.contact_id)}
                                                disabled={deletingContactId === contact.contact_id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Eliminar contacto"
                                            >
                                                {deletingContactId === contact.contact_id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 text-sm">
                                        {contact.phone_mobile && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone size={14} />
                                                <span>Móvil: {contact.phone_mobile}</span>
                                            </div>
                                        )}
                                        {contact.phone_work && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Building size={14} />
                                                <span>Trabajo: {contact.phone_work}</span>
                                            </div>
                                        )}
                                        {contact.phone_home && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User size={14} />
                                                <span>Casa: {contact.phone_home}</span>
                                            </div>
                                        )}
                                        {contact.email && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail size={14} />
                                                <span className="truncate">{contact.email}</span>
                                            </div>
                                        )}
                                        {contact.address && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={14} />
                                                <span className="truncate">{contact.address}</span>
                                            </div>
                                        )}
                                        {contact.company && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Building size={14} />
                                                <span className="truncate">
                                                    {contact.position ? `${contact.position} en ${contact.company}` : contact.company}
                                                </span>
                                            </div>
                                        )}
                                        {contact.birthday && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar size={14} />
                                                <span>{new Date(contact.birthday).toLocaleDateString('es-ES')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {contact.notes && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
                                        </div>
                                    )}
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

                                    {/* Información de contacto - Múltiples teléfonos */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono Móvil</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_mobile}
                                                onChange={(e) => setFormData({...formData, phone_mobile: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 666 123 456"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono Trabajo</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_work}
                                                onChange={(e) => setFormData({...formData, phone_work: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 91 123 4567"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono Casa</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_home}
                                                onChange={(e) => setFormData({...formData, phone_home: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 91 765 4321"
                                            />
                                        </div>
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

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dirección</label>
                                        <input
                                            ref={addressInputRef}
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Empieza a escribir para buscar direcciones..."
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
                                            <select
                                                value={formData.position}
                                                onChange={(e) => setFormData({...formData, position: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Seleccionar cargo...</option>
                                                {commonPositions.map(position => (
                                                    <option key={position} value={position}>
                                                        {position}
                                                    </option>
                                                ))}
                                            </select>
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
                                                    Creando...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="mr-2" size={16} />
                                                    Crear Contacto
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

                                    {/* Información de contacto - Múltiples teléfonos */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono Móvil</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_mobile}
                                                onChange={(e) => setFormData({...formData, phone_mobile: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 666 123 456"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono Trabajo</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_work}
                                                onChange={(e) => setFormData({...formData, phone_work: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 91 123 4567"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono Casa</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_home}
                                                onChange={(e) => setFormData({...formData, phone_home: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="+34 91 765 4321"
                                            />
                                        </div>
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

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dirección</label>
                                        <input
                                            ref={addressInputRef}
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Empieza a escribir para buscar direcciones..."
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
                                            <select
                                                value={formData.position}
                                                onChange={(e) => setFormData({...formData, position: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Seleccionar cargo...</option>
                                                {commonPositions.map(position => (
                                                    <option key={position} value={position}>
                                                        {position}
                                                    </option>
                                                ))}
                                            </select>
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
