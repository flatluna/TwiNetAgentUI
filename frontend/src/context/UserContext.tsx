import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  // Demo user - using existing Twin ID from the project
  const [user, setUser] = useState<User | null>({
    twinId: "TestTwin2024",
    userName: "Demo Twin Usuario",
    email: "demo@twinagent.com",
    isAuthenticated: true
  });

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
