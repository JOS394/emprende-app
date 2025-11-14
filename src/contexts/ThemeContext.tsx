import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Colors, ColorScheme, Theme } from '../constants/theme';
import { logger } from '../utils/logger';

interface ThemeContextType {
  theme: typeof Colors.light;
  colorScheme: ColorScheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (scheme: ColorScheme) => void;
  fullTheme: typeof Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_preference';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme() || 'light';
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencia guardada al iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setColorScheme(savedTheme);
        logger.log('Tema cargado desde AsyncStorage:', savedTheme);
      } else {
        // Si no hay preferencia guardada, usar el tema del sistema
        setColorScheme(systemColorScheme);
        logger.log('Usando tema del sistema:', systemColorScheme);
      }
    } catch (error) {
      logger.error('Error cargando preferencia de tema:', error);
      setColorScheme(systemColorScheme);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      logger.log('Tema guardado en AsyncStorage:', scheme);
    } catch (error) {
      logger.error('Error guardando preferencia de tema:', error);
    }
  };

  const toggleTheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
    saveThemePreference(newScheme);
  };

  const setTheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    saveThemePreference(scheme);
  };

  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isDarkMode = colorScheme === 'dark';

  // Crear el objeto de tema completo con colores dinámicos
  const fullTheme = {
    ...Theme,
    colors: theme,
  };

  const value: ThemeContextType = {
    theme,
    colorScheme,
    isDarkMode,
    toggleTheme,
    setTheme,
    fullTheme,
  };

  // No renderizar hijos hasta que se cargue la preferencia
  if (isLoading) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook personalizado para usar el tema
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Hook para obtener solo los colores (uso más común)
export const useColors = () => {
  const { theme } = useTheme();
  return theme;
};

// Hook para obtener el tema completo
export const useFullTheme = () => {
  const { fullTheme } = useTheme();
  return fullTheme;
};
