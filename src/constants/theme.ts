/**
 * Theme Constants
 * Colores, tamaños y configuraciones del tema de la aplicación
 */

// Colores base
export const Colors = {
  light: {
    // Colores primarios
    primary: '#2196F3',
    primaryDark: '#1976D2',
    primaryLight: '#64B5F6',

    // Colores secundarios
    secondary: '#4CAF50',
    secondaryDark: '#388E3C',
    secondaryLight: '#81C784',

    // Colores de acento
    accent: '#FF9800',
    accentDark: '#F57C00',
    accentLight: '#FFB74D',

    // Colores de estado
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Colores de fondo
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#FAFAFA',

    // Colores de superficie
    surface: '#FFFFFF',
    surfaceVariant: '#F8F9FA',

    // Colores de texto
    text: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',

    // Colores de borde
    border: '#E0E0E0',
    borderLight: '#EEEEEE',
    borderDark: '#CCCCCC',

    // Colores de sombra
    shadow: '#000000',

    // Colores específicos de la app
    vip: '#FF9800',
    regular: '#2196F3',
    newCustomer: '#4CAF50',

    // Estados de orden
    pending: '#FF9800',
    confirmed: '#2196F3',
    preparing: '#9C27B0',
    ready: '#4CAF50',
    delivered: '#4CAF50',
    cancelled: '#F44336',

    // Estado de pago
    paid: '#4CAF50',
    unpaid: '#FF9800',

    // Colores de categorías
    categoryActive: '#2196F3',
    categoryInactive: '#F0F0F0',
    categoryText: '#666666',
    categoryTextActive: '#FFFFFF',

    // Colores de stock
    stockHigh: '#4CAF50',
    stockMedium: '#FF9800',
    stockLow: '#F44336',
    stockEmpty: '#F44336',

    // Tabs
    tabActive: '#2196F3',
    tabInactive: '#999999',
  },

  dark: {
    // Colores primarios
    primary: '#64B5F6',
    primaryDark: '#42A5F5',
    primaryLight: '#90CAF9',

    // Colores secundarios
    secondary: '#81C784',
    secondaryDark: '#66BB6A',
    secondaryLight: '#A5D6A7',

    // Colores de acento
    accent: '#FFB74D',
    accentDark: '#FFA726',
    accentLight: '#FFCC80',

    // Colores de estado
    success: '#81C784',
    warning: '#FFB74D',
    error: '#E57373',
    info: '#64B5F6',

    // Colores de fondo
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2C2C2C',

    // Colores de superficie
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',

    // Colores de texto
    text: '#E0E0E0',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textInverse: '#121212',

    // Colores de borde
    border: '#3A3A3A',
    borderLight: '#2C2C2C',
    borderDark: '#4A4A4A',

    // Colores de sombra
    shadow: '#000000',

    // Colores específicos de la app
    vip: '#FFB74D',
    regular: '#64B5F6',
    newCustomer: '#81C784',

    // Estados de orden
    pending: '#FFB74D',
    confirmed: '#64B5F6',
    preparing: '#BA68C8',
    ready: '#81C784',
    delivered: '#81C784',
    cancelled: '#E57373',

    // Estado de pago
    paid: '#81C784',
    unpaid: '#FFB74D',

    // Colores de categorías
    categoryActive: '#64B5F6',
    categoryInactive: '#2C2C2C',
    categoryText: '#B0B0B0',
    categoryTextActive: '#121212',

    // Colores de stock
    stockHigh: '#81C784',
    stockMedium: '#FFB74D',
    stockLow: '#E57373',
    stockEmpty: '#E57373',

    // Tabs
    tabActive: '#64B5F6',
    tabInactive: '#808080',
  },
};

// Espaciado
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

// Tamaños de fuente
export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
  massive: 32,
};

// Tamaños de borde redondeado
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 999,
};

// Sombras
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Constantes de negocio
export const BusinessConstants = {
  // Umbral de cliente VIP (en moneda local)
  VIP_THRESHOLD: 100000,

  // Nivel de stock bajo (alertas)
  LOW_STOCK_THRESHOLD: 10,

  // Nivel de stock crítico
  CRITICAL_STOCK_THRESHOLD: 5,

  // Máximo de items por página (paginación)
  ITEMS_PER_PAGE: 20,

  // Tiempo de timeout para requests (ms)
  REQUEST_TIMEOUT: 30000,

  // Máximo de intentos para sync
  MAX_SYNC_RETRIES: 3,

  // Intervalo de auto-save (ms)
  AUTO_SAVE_INTERVAL: 60000, // 1 minuto

  // Tamaño máximo de imagen (bytes)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB

  // Calidad de imagen para upload
  IMAGE_QUALITY: 0.8,
};

// Animaciones
export const Animations = {
  // Duraciones
  fast: 150,
  normal: 300,
  slow: 500,

  // Tipos de easing (para Animated API)
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Configuración de iconos
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Configuración de formularios
export const FormConfig = {
  // Altura de inputs
  inputHeight: 48,
  inputHeightSmall: 40,
  inputHeightLarge: 56,

  // Altura de textarea
  textAreaHeight: 80,

  // Altura de botones
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonHeightLarge: 56,
};

// Layout
export const Layout = {
  // Máximo ancho de contenido (para tablets)
  maxContentWidth: 600,

  // Padding horizontal del contenedor
  containerPadding: 15,

  // Padding de cards
  cardPadding: 15,

  // Altura de header
  headerHeight: 60,

  // Altura de tab bar
  tabBarHeight: 60,
};

// Tipografía
export const Typography = {
  // Pesos de fuente
  fontWeights: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },

  // Altura de línea
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

// Tiempos de espera
export const Timeouts = {
  // Toast/Snackbar
  shortToast: 2000,
  mediumToast: 3000,
  longToast: 5000,

  // Splash screen
  splashScreen: 2000,

  // Debounce para búsqueda
  searchDebounce: 300,

  // Auto-logout (inactividad)
  autoLogout: 30 * 60 * 1000, // 30 minutos
};

// Configuración de listas
export const ListConfig = {
  // Altura de items
  itemHeight: 80,
  itemHeightSmall: 60,
  itemHeightLarge: 100,

  // Separador
  separatorHeight: 1,

  // Padding de items
  itemPadding: 15,
};

// Export por defecto del tema completo
export const Theme = {
  colors: Colors,
  spacing: Spacing,
  fontSizes: FontSizes,
  borderRadius: BorderRadius,
  shadows: Shadows,
  business: BusinessConstants,
  animations: Animations,
  iconSizes: IconSizes,
  formConfig: FormConfig,
  layout: Layout,
  typography: Typography,
  timeouts: Timeouts,
  listConfig: ListConfig,
};

export type ThemeType = typeof Theme;
export type ColorScheme = 'light' | 'dark';
