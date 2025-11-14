import { useState, useCallback, useEffect } from 'react';
import { BusinessConstants } from '../constants/theme';

export interface PaginationState<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
}

export interface UsePaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> extends PaginationState<T> {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  setItems: (items: T[]) => void;
}

/**
 * Hook personalizado para manejar paginación con infinite scroll
 *
 * @example
 * const {
 *   items,
 *   isLoading,
 *   loadMore,
 *   refresh,
 * } = usePagination(async (page, limit) => {
 *   const result = await ProductsService.getProducts(page, limit);
 *   return {
 *     items: result.products,
 *     totalItems: result.total,
 *   };
 * });
 */
export function usePagination<T>(
  fetchFunction: (page: number, limit: number) => Promise<{ items: T[]; totalItems: number }>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    itemsPerPage = BusinessConstants.ITEMS_PER_PAGE,
    initialPage = 1,
  } = options;

  const [state, setState] = useState<PaginationState<T>>({
    items: [],
    page: initialPage,
    totalPages: 0,
    totalItems: 0,
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    error: null,
  });

  /**
   * Carga la primera página de datos
   */
  const loadInitial = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchFunction(initialPage, itemsPerPage);
      const totalPages = Math.ceil(result.totalItems / itemsPerPage);

      setState({
        items: result.items,
        page: initialPage,
        totalPages,
        totalItems: result.totalItems,
        isLoading: false,
        isLoadingMore: false,
        hasMore: initialPage < totalPages,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al cargar datos',
      }));
    }
  }, [fetchFunction, itemsPerPage, initialPage]);

  /**
   * Carga la siguiente página de datos (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    // No cargar si ya estamos cargando o no hay más datos
    if (state.isLoadingMore || !state.hasMore || state.isLoading) {
      return;
    }

    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const nextPage = state.page + 1;
      const result = await fetchFunction(nextPage, itemsPerPage);
      const totalPages = Math.ceil(result.totalItems / itemsPerPage);

      setState(prev => ({
        ...prev,
        items: [...prev.items, ...result.items],
        page: nextPage,
        totalPages,
        totalItems: result.totalItems,
        isLoadingMore: false,
        hasMore: nextPage < totalPages,
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoadingMore: false,
        error: error.message || 'Error al cargar más datos',
      }));
    }
  }, [state.isLoadingMore, state.hasMore, state.isLoading, state.page, fetchFunction, itemsPerPage]);

  /**
   * Refresca la lista desde la primera página
   */
  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  /**
   * Resetea el estado a los valores iniciales
   */
  const reset = useCallback(() => {
    setState({
      items: [],
      page: initialPage,
      totalPages: 0,
      totalItems: 0,
      isLoading: true,
      isLoadingMore: false,
      hasMore: true,
      error: null,
    });
  }, [initialPage]);

  /**
   * Establece los items manualmente (útil para búsqueda local)
   */
  const setItems = useCallback((items: T[]) => {
    setState(prev => ({
      ...prev,
      items,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / itemsPerPage),
      hasMore: false,
    }));
  }, [itemsPerPage]);

  // Cargar datos iniciales al montar
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    ...state,
    loadMore,
    refresh,
    reset,
    setItems,
  };
}

/**
 * Hook simplificado para búsqueda con debounce y paginación
 */
export function useSearchPagination<T>(
  searchFunction: (query: string, page: number, limit: number) => Promise<{ items: T[]; totalItems: number }>,
  debounceMs: number = 300,
  options: UsePaginationOptions = {}
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce del query de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Función de fetch que incluye el query
  const fetchWithSearch = useCallback(
    (page: number, limit: number) => {
      return searchFunction(debouncedQuery, page, limit);
    },
    [searchFunction, debouncedQuery]
  );

  const pagination = usePagination(fetchWithSearch, options);

  return {
    ...pagination,
    searchQuery,
    setSearchQuery,
  };
}
