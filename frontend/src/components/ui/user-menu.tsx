import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";

interface UserMenuProps {
  userName?: string;
  onLogout: () => void;
  onProfile: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  userName = "Twin User", 
  onLogout, 
  onProfile 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <Button
        variant="ghost"
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-gray-800 dark:text-white dark-blue:text-white text-clear-dark">{userName}</div>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-800 dark:text-white dark-blue:text-white heading-clear-dark">{userName}</div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => handleMenuClick(onProfile)}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User size={16} className="mr-3 text-gray-500" />
              Ver Perfil
            </button>
            
            <button
              onClick={() => handleMenuClick(() => {})}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings size={16} className="mr-3 text-gray-500" />
              Configuración
            </button>

            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => handleMenuClick(onLogout)}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} className="mr-3 text-red-500" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
