import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useMsal } from '@azure/msal-react';

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
  const { user } = useUser();
  const { accounts } = useMsal();

  useEffect(() => {
    const getTwinId = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener directamente desde MSAL accounts (PRIORIDAD MÁXIMA)
        if (accounts && accounts.length > 0) {
          const realTwinId = accounts[0].localAccountId;
          console.log('✅ TwinId obtenido directamente de MSAL:', realTwinId);
          setTwinId(realTwinId);
          localStorage.setItem('twinId', realTwinId);
          setLoading(false);
          return;
        }

        // 2. Obtener del contexto de usuario como fallback
        if (user?.twinId && user.twinId !== 'TestTwin2024') {
          console.log('✅ TwinId obtenido del contexto de usuario:', user.twinId);
          setTwinId(user.twinId);
          localStorage.setItem('twinId', user.twinId);
          setLoading(false);
          return;
        }

        // 3. Local Storage (como último recurso)
        const storedTwinId = localStorage.getItem('twinId');
        if (storedTwinId && storedTwinId !== 'TestTwin2024') {
          setTwinId(storedTwinId);
          setLoading(false);
          return;
        }

        // 4. Si llegamos aquí, no hay TwinId válido
        throw new Error('No se encontró un TwinId válido del usuario autenticado');

      } catch (err) {
        console.error('❌ Error al obtener Twin ID:', err);
        setError('No se pudo obtener el identificador del twin del usuario');
      } finally {
        setLoading(false);
      }
    };

    getTwinId();
  }, [user, accounts]);

  return { twinId, loading, error };
};

/**
 * Función utilitaria para obtener el Twin ID de forma síncrona
 * Útil cuando ya se sabe que el Twin ID está disponible
 */
export const getCurrentTwinId = (): string | null => {
  // Intentar obtener de localStorage primero
  const storedTwinId = localStorage.getItem('twinId');
  if (storedTwinId && storedTwinId !== 'default-twin-id') {
    return storedTwinId;
  }

  // Fallback a sessionStorage
  const sessionTwinId = sessionStorage.getItem('twinId');
  if (sessionTwinId && sessionTwinId !== 'default-twin-id') {
    localStorage.setItem('twinId', sessionTwinId);
    return sessionTwinId;
  }

  // No usar valores por defecto - devolver null si no hay TwinId real
  console.warn('⚠️ No se encontró Twin ID válido del usuario');
  return null;
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