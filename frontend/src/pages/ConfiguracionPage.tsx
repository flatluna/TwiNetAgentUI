import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Monitor, Settings2 } from "lucide-react";

const ConfiguracionPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [apiKey, setApiKey] = useState("AIzaSyCbH7BdKombRuTBAOavP3zX4T8pw5eIVxo");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [browserNotifications, setBrowserNotifications] = useState(true);

    const handleSave = () => {
        // Save settings logic here
        console.log("Saving settings:", {
            theme,
            apiKey,
            emailNotifications,
            browserNotifications
        });
        // Could show a toast notification here
    };

    const themeOptions = [
        { value: 'light', label: 'Claro', icon: Sun, description: 'Tema claro y brillante' },
        { value: 'dark', label: 'Oscuro', icon: Moon, description: 'Tema oscuro con buen contraste' },
        { value: 'dark-blue', label: 'Azul Oscuro', icon: Monitor, description: 'Tema azul profesional' },
        { value: 'auto', label: 'Automático', icon: Monitor, description: 'Sigue el sistema' }
    ];

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground heading-clear-dark">Configuración del Sistema</h2>
                    <p className="text-muted-foreground text-clear-dark">Ajusta las preferencias y configuraciones de TwinAgent</p>
                </div>

                {/* Contenido principal */}
                <div className="bg-card rounded-lg shadow-sm p-6 border">
                    <div className="space-y-6">
                        {/* Configuración de API */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-foreground heading-clear-dark">Configuración de API</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-foreground text-clear-dark">
                                        Google Maps API Key
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Tu API Key de Google Maps"
                                        className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-clear-dark focus:ring-2 focus:ring-ring focus:border-transparent"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                    <p className="text-sm text-muted-foreground text-clear-dark mt-1">
                                        Necesario para la funcionalidad de autocompletado de direcciones
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Configuración de tema */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground heading-clear-dark">
                                <Settings2 className="mr-2" size={20} />
                                Apariencia
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-3 text-foreground text-clear-dark">
                                        Tema
                                    </label>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {themeOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setTheme(option.value as any)}
                                                    className={`theme-card p-4 border border-border rounded-lg transition-all hover:border-blue-300 dark:hover:border-blue-400 ${
                                                        theme === option.value 
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark-blue:bg-blue-900/30' 
                                                            : 'border-border bg-card hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <Icon className="mx-auto mb-2 text-foreground" size={24} />
                                                    <div className="text-sm font-medium text-foreground text-clear-dark">{option.label}</div>
                                                    <div className="text-xs text-muted-foreground text-clear-dark mt-1">
                                                        {option.description}
                                                    </div>
                                                    {option.value === 'auto' && (
                                                        <div className="text-xs text-muted-foreground text-clear-dark mt-1">
                                                            Actual: {resolvedTheme === 'dark' ? 'Oscuro' : resolvedTheme === 'dark-blue' ? 'Azul' : 'Claro'}
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-foreground text-clear-dark">
                                        Idioma
                                    </label>
                                    <select className="w-full border border-border rounded px-3 py-2 bg-background text-foreground text-clear-dark focus:ring-2 focus:ring-ring focus:border-transparent">
                                        <option value="es">Español</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Configuración de notificaciones */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-foreground heading-clear-dark">Notificaciones</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <input 
                                        type="checkbox" 
                                        id="email-notifications" 
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                        className="rounded border-border text-primary focus:ring-2 focus:ring-ring"
                                    />
                                    <label htmlFor="email-notifications" className="text-sm text-foreground text-clear-dark">
                                        Recibir notificaciones por email
                                    </label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input 
                                        type="checkbox" 
                                        id="browser-notifications" 
                                        checked={browserNotifications}
                                        onChange={(e) => setBrowserNotifications(e.target.checked)}
                                        className="rounded border-border text-primary focus:ring-2 focus:ring-ring"
                                    />
                                    <label htmlFor="browser-notifications" className="text-sm text-foreground text-clear-dark">
                                        Recibir notificaciones del navegador
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <Button variant="outline" onClick={() => navigate("/")}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave}>
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionPage;
