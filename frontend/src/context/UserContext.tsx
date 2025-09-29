import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';

export interface User {
  twinId: string;
  userName: string;
  email?: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { accounts } = useMsal();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Obtener el TwinID real del usuario autenticado desde MSAL
    if (accounts && accounts.length > 0) {
      const msalAccount = accounts[0];
      const realTwinId = msalAccount.localAccountId;
      
      console.log('🔐 Usuario autenticado detectado:', {
        username: msalAccount.username,
        name: msalAccount.name,
        localAccountId: msalAccount.localAccountId,
        homeAccountId: msalAccount.homeAccountId
      });

      setUser({
        twinId: realTwinId, // Usar el TwinID real del usuario autenticado
        userName: msalAccount.name || msalAccount.username || "Usuario",
        email: msalAccount.username,
        isAuthenticated: true
      });
    } else {
      console.log('❌ No hay usuario autenticado');
      setUser(null);
    }
  }, [accounts]);

  const logout = () => {
    setUser(null);
    // Add additional logout logic here (clear tokens, redirect, etc.)
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
