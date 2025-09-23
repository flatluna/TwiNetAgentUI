import { useState, useEffect } from 'react';

interface TwinIdConfig {
  twinId: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener el Twin ID del usuario actual
 * Este ID se usa para las llamadas a la API que requieren identificación del twin
 */
export const useTwinId = (): TwinIdConfig => {
  const [twinId, setTwinId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTwinId = async () => {
      try {
        setLoading(true);
        setError(null);

        // Intentar obtener el twinId de diferentes fuentes
        // 1. Local Storage (si se guardó previamente)
        const storedTwinId = localStorage.getItem('twinId');
        if (storedTwinId) {
          setTwinId(storedTwinId);
          setLoading(false);
          return;
        }

        // 2. Session Storage
        const sessionTwinId = sessionStorage.getItem('twinId');
        if (sessionTwinId) {
          setTwinId(sessionTwinId);
          localStorage.setItem('twinId', sessionTwinId);
          setLoading(false);
          return;
        }

        // 3. Obtener desde la API o contexto de autenticación
        // TODO: Implementar según tu sistema de autenticación
        // Por ejemplo, desde Microsoft Entra ID o el contexto de usuario
        // 
        // Ejemplo de integración:
        // const userContext = useContext(UserContext);
        // const authContext = useContext(AuthContext);
        // if (userContext?.user?.twinId) {
        //   setTwinId(userContext.user.twinId);
        //   localStorage.setItem('twinId', userContext.user.twinId);
        //   return;
        // }
        //
        // O llamada a API:
        // const response = await fetch('/api/user/twin-id', {
        //   headers: { Authorization: `Bearer ${authContext.token}` }
        // });
        // const { twinId } = await response.json();
        
        // 4. Valor por defecto temporal para desarrollo
        const defaultTwinId = 'default-twin-id';
        console.warn('⚠️ Usando Twin ID por defecto para desarrollo:', defaultTwinId);
        setTwinId(defaultTwinId);
        localStorage.setItem('twinId', defaultTwinId);

      } catch (err) {
        console.error('Error al obtener Twin ID:', err);
        setError('No se pudo obtener el identificador del twin');
      } finally {
        setLoading(false);
      }
    };

    getTwinId();
  }, []);

  return { twinId, loading, error };
};

/**
 * Función utilitaria para obtener el Twin ID de forma síncrona
 * Útil cuando ya se sabe que el Twin ID está disponible
 */
export const getCurrentTwinId = (): string | null => {
  // Intentar obtener de localStorage primero
  const storedTwinId = localStorage.getItem('twinId');
  if (storedTwinId) {
    return storedTwinId;
  }

  // Fallback a sessionStorage
  const sessionTwinId = sessionStorage.getItem('twinId');
  if (sessionTwinId) {
    localStorage.setItem('twinId', sessionTwinId);
    return sessionTwinId;
  }

  // Valor por defecto para desarrollo
  console.warn('⚠️ No se encontró Twin ID, usando valor por defecto');
  return 'default-twin-id';
};

/**
 * Función para establecer el Twin ID manualmente
 * Útil después del login o cuando se obtiene de la API
 */
export const setTwinId = (newTwinId: string): void => {
  localStorage.setItem('twinId', newTwinId);
  sessionStorage.setItem('twinId', newTwinId);
};

/**
 * Función para limpiar el Twin ID
 * Útil durante el logout
 */
export const clearTwinId = (): void => {
  localStorage.removeItem('twinId');
  sessionStorage.removeItem('twinId');
};