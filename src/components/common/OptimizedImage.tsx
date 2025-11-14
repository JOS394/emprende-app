import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageProps,
  StyleSheet,
  View,
  ActivityIndicator,
  ImageStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  placeholder?: React.ReactNode;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  showLoader?: boolean;
  loaderSize?: 'small' | 'large';
  loaderColor?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
  containerStyle?: StyleProp<ImageStyle>;
}

/**
 * Componente de imagen optimizada con:
 * - Lazy loading
 * - Indicador de carga
 * - Placeholder/fallback
 * - Caché automático
 * - Manejo de errores
 *
 * @example
 * <OptimizedImage
 *   uri={product.image}
 *   style={styles.productImage}
 *   fallbackIcon="image-outline"
 *   showLoader
 * />
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  placeholder,
  fallbackIcon = 'image-outline',
  fallbackIconSize = 48,
  fallbackIconColor = '#ccc',
  showLoader = true,
  loaderSize = 'small',
  loaderColor = '#2196F3',
  onLoadStart,
  onLoadEnd,
  onError,
  containerStyle,
  style,
  ...imageProps
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Implementar lazy loading: solo cargar cuando el componente esté montado
  useEffect(() => {
    // Pequeño delay para lazy loading
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Si no hay URI o hubo error, mostrar fallback
  if (!uri || hasError) {
    return (
      <View style={[styles.fallbackContainer, containerStyle, style]}>
        {placeholder || (
          <Ionicons
            name={fallbackIcon}
            size={fallbackIconSize}
            color={fallbackIconColor}
          />
        )}
      </View>
    );
  }

  // Si aún no debe cargar, mostrar placeholder
  if (!shouldLoad) {
    return (
      <View style={[styles.fallbackContainer, containerStyle, style]}>
        {placeholder || (
          <Ionicons
            name={fallbackIcon}
            size={fallbackIconSize}
            color={fallbackIconColor}
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        {...imageProps}
        source={{ uri }}
        style={style}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        // Optimizaciones de rendimiento
        fadeDuration={200}
        resizeMethod="resize"
        resizeMode={imageProps.resizeMode || 'cover'}
      />

      {/* Indicador de carga */}
      {isLoading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={loaderSize} color={loaderColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  fallbackContainer: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
