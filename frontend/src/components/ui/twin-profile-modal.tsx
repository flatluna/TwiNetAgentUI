import React from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Globe, Heart, Languages, Link2, Facebook, Instagram, Twitter, Briefcase, Heart as Medical, FileText, Users, Building } from 'lucide-react';
import { Button } from './button';
import { type TwinProfileResponse } from '@/services/twinApiService';

interface TwinProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: TwinProfileResponse | null;
    loading?: boolean;
}

export const TwinProfileModal: React.FC<TwinProfileModalProps> = ({
    isOpen,
    onClose,
    profile,
    loading = false
}) => {
    if (!isOpen) return null;

    // Debug: Log the profile data to console
    console.log('🔍 TwinProfileModal received profile:', profile);
    console.log('🔍 Profile type:', typeof profile);
    console.log('🔍 Profile keys:', profile ? Object.keys(profile) : 'null');
    
    if (profile) {
        console.log('🔍 firstName:', profile.firstName);
        console.log('🔍 lastName:', profile.lastName);
        console.log('🔍 email:', profile.email);
        console.log('🔍 subscriptionId:', profile.subscriptionId);
        console.log('🔍 twinName:', profile.twinName);
        console.log('🔍 id:', profile.id);
        console.log('🔍 createdAt:', profile.createdAt);
        console.log('🔍 lastModified:', profile.lastModified);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Perfil de Twin
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">
                                Cargando perfil...
                            </span>
                        </div>
                    ) : profile ? (
                        <div className="space-y-6">
                            {/* Subscription ID - Prominent display at top */}
                            {profile.subscriptionId && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                                                <span className="text-yellow-600 dark:text-yellow-300 font-semibold text-sm">ID</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                Subscription ID
                                            </p>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300 font-mono break-all">
                                                {profile.subscriptionId}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {profile.firstName || ''} {profile.lastName || ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {profile.email || 'No especificado'}
                                            </p>
                                        </div>
                                    </div>

                                    {profile.phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {profile.phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {profile.address && (
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {profile.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {profile.dateOfBirth && (
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Nacimiento</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {profile.dateOfBirth}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-3">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Nacionalidad</p>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {profile.nationality || 'No especificado'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            {((profile.interests && profile.interests.length > 0) || (profile.languages && profile.languages.length > 0)) && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {profile.interests && profile.interests.length > 0 && (
                                            <div className="flex items-start space-x-3">
                                                <Heart className="h-5 w-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Intereses</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {profile.interests.map((interest, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                                                            >
                                                                {interest}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {profile.languages && profile.languages.length > 0 && (
                                            <div className="flex items-start space-x-3">
                                                <Languages className="h-5 w-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Idiomas</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {profile.languages.map((language, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs"
                                                            >
                                                                {language}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bio */}
                            {profile.personalBio && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Biografía
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {profile.personalBio}
                                    </p>
                                </div>
                            )}

                            {/* System Info */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                    <div>
                                        <p><strong>Twin ID:</strong> {profile.twinId || profile.id || 'No disponible'}</p>
                                        <p><strong>Creado:</strong> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'No disponible'}</p>
                                    </div>
                                    <div>
                                        <p><strong>Twin Name:</strong> {profile.twinName || 'No disponible'}</p>
                                        <p><strong>Actualizado:</strong> {profile.lastModified ? new Date(profile.lastModified).toLocaleDateString() : 'No disponible'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                                No se pudo cargar el perfil del Twin
                            </p>
                            <p className="text-xs text-gray-400">
                                Verifica la consola del navegador para más detalles
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TwinProfileModal;
