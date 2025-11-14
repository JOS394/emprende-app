/**
 * Utilidades de validación reutilizables
 *
 * Centraliza todas las validaciones del proyecto para mantener
 * consistencia y facilitar el mantenimiento
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida que un string no esté vacío
 */
export const validateRequired = (value: string, fieldName: string = 'Campo'): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} es requerido`,
    };
  }
  return { isValid: true };
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { isValid: true }; // Email es opcional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'El formato del email no es válido',
    };
  }

  return { isValid: true };
};

/**
 * Valida formato de teléfono
 * Acepta números, espacios, guiones, paréntesis y signo +
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true }; // Teléfono es opcional
  }

  const phoneRegex = /^[\d\s\-\+\(\)]+$/;

  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      error: 'El teléfono solo debe contener números, espacios, guiones y paréntesis',
    };
  }

  if (phone.replace(/[\s\-\+\(\)]/g, '').length < 7) {
    return {
      isValid: false,
      error: 'El teléfono debe tener al menos 7 dígitos',
    };
  }

  return { isValid: true };
};

/**
 * Valida que un número sea válido y no negativo
 */
export const validatePositiveNumber = (
  value: string | number,
  fieldName: string = 'Valor',
  options: { allowZero?: boolean; required?: boolean } = {}
): ValidationResult => {
  const { allowZero = true, required = false } = options;

  // Si no es requerido y está vacío, es válido
  if (!required && (value === '' || value === null || value === undefined)) {
    return { isValid: true };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: `${fieldName} debe ser un número válido`,
    };
  }

  if (numValue < 0) {
    return {
      isValid: false,
      error: `${fieldName} no puede ser negativo`,
    };
  }

  if (!allowZero && numValue === 0) {
    return {
      isValid: false,
      error: `${fieldName} debe ser mayor que cero`,
    };
  }

  return { isValid: true };
};

/**
 * Valida precio (debe ser positivo)
 */
export const validatePrice = (price: string | number): ValidationResult => {
  return validatePositiveNumber(price, 'El precio', { allowZero: false, required: true });
};

/**
 * Valida costo (puede ser 0, opcional)
 */
export const validateCost = (cost: string | number): ValidationResult => {
  if (cost === '' || cost === null || cost === undefined) {
    return { isValid: true };
  }
  return validatePositiveNumber(cost, 'El costo', { allowZero: true, required: false });
};

/**
 * Valida stock/cantidad
 */
export const validateStock = (stock: string | number, required: boolean = false): ValidationResult => {
  return validatePositiveNumber(stock, 'El stock', { allowZero: true, required });
};

/**
 * Valida cantidad en pedidos (debe ser mayor que 0)
 */
export const validateQuantity = (quantity: string | number): ValidationResult => {
  return validatePositiveNumber(quantity, 'La cantidad', { allowZero: false, required: true });
};

/**
 * Valida formato de hora (HH:MM)
 */
export const validateTimeFormat = (time: string): ValidationResult => {
  if (!time || time.trim().length === 0) {
    return {
      isValid: false,
      error: 'La hora es requerida',
    };
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timeRegex.test(time)) {
    return {
      isValid: false,
      error: 'Formato de hora inválido (debe ser HH:MM)',
    };
  }

  return { isValid: true };
};

/**
 * Valida que hora de apertura sea menor que hora de cierre
 */
export const validateTimeRange = (openTime: string, closeTime: string): ValidationResult => {
  const openValidation = validateTimeFormat(openTime);
  if (!openValidation.isValid) return openValidation;

  const closeValidation = validateTimeFormat(closeTime);
  if (!closeValidation.isValid) return closeValidation;

  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  if (openMinutes >= closeMinutes) {
    return {
      isValid: false,
      error: 'La hora de apertura debe ser menor que la de cierre',
    };
  }

  return { isValid: true };
};

/**
 * Valida longitud mínima de texto
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string = 'Campo'
): ValidationResult => {
  if (!value || value.trim().length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} debe tener al menos ${minLength} caracteres`,
    };
  }

  return { isValid: true };
};

/**
 * Valida longitud máxima de texto
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string = 'Campo'
): ValidationResult => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} no puede exceder ${maxLength} caracteres`,
    };
  }

  return { isValid: true };
};

/**
 * Valida URL (opcional)
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url || url.trim().length === 0) {
    return { isValid: true }; // URL es opcional
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'El formato de la URL no es válido',
    };
  }
};

/**
 * Ejecuta múltiples validaciones y retorna el primer error
 */
export const validateMultiple = (...validations: ValidationResult[]): ValidationResult => {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
};

/**
 * Valida datos de un producto
 */
export const validateProduct = (product: {
  name: string;
  price: string | number;
  cost?: string | number;
  stock?: string | number;
}): ValidationResult => {
  return validateMultiple(
    validateRequired(product.name, 'El nombre del producto'),
    validatePrice(product.price),
    product.cost !== undefined && product.cost !== '' ? validateCost(product.cost) : { isValid: true },
    product.stock !== undefined && product.stock !== '' ? validateStock(product.stock) : { isValid: true }
  );
};

/**
 * Valida datos de un cliente
 */
export const validateCustomer = (customer: {
  name: string;
  phone: string;
  email?: string;
}): ValidationResult => {
  return validateMultiple(
    validateRequired(customer.name, 'El nombre del cliente'),
    validateRequired(customer.phone, 'El teléfono del cliente'),
    validatePhone(customer.phone),
    customer.email ? validateEmail(customer.email) : { isValid: true }
  );
};

/**
 * Valida item de orden
 */
export const validateOrderItem = (item: {
  productId: string | number;
  productName: string;
  quantity: number;
  price: number;
}): ValidationResult => {
  if (!item.productId || item.productId === '' || item.productId === '0') {
    return {
      isValid: false,
      error: 'Debe seleccionar un producto',
    };
  }

  if (!item.productName || item.productName.trim() === '') {
    return {
      isValid: false,
      error: 'El producto debe tener un nombre',
    };
  }

  const quantityValidation = validateQuantity(item.quantity);
  if (!quantityValidation.isValid) return quantityValidation;

  const priceValidation = validatePrice(item.price);
  if (!priceValidation.isValid) return priceValidation;

  return { isValid: true };
};

/**
 * Valida disponibilidad de stock
 */
export const validateStockAvailability = (
  requestedQuantity: number,
  availableStock: number,
  productName: string
): ValidationResult => {
  if (requestedQuantity > availableStock) {
    return {
      isValid: false,
      error: `${productName}: Stock disponible (${availableStock}) menor que cantidad solicitada (${requestedQuantity})`,
    };
  }

  return { isValid: true };
};

// Exportar todo como objeto para uso conveniente
export const Validators = {
  required: validateRequired,
  email: validateEmail,
  phone: validatePhone,
  positiveNumber: validatePositiveNumber,
  price: validatePrice,
  cost: validateCost,
  stock: validateStock,
  quantity: validateQuantity,
  timeFormat: validateTimeFormat,
  timeRange: validateTimeRange,
  minLength: validateMinLength,
  maxLength: validateMaxLength,
  url: validateURL,
  multiple: validateMultiple,
  product: validateProduct,
  customer: validateCustomer,
  orderItem: validateOrderItem,
  stockAvailability: validateStockAvailability,
};

export default Validators;
