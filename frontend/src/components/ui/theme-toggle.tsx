import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'dark-blue', 'auto'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'auto':
        return <Monitor size={16} />;
      default:
        return <Sun size={16} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Tema: Claro';
      case 'dark':
        return 'Tema: Oscuro';
      case 'dark-blue':
        return 'Tema: Azul';
      case 'auto':
        return `Tema: Auto (${resolvedTheme === 'dark' ? 'Oscuro' : resolvedTheme === 'dark-blue' ? 'Azul' : 'Claro'})`;
      default:
        return 'Tema';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="flex items-center space-x-2 text-sm"
      title={getLabel()}
    >
      {getIcon()}
      <span className="hidden md:inline">{getLabel()}</span>
    </Button>
  );
};

export default ThemeToggle;
