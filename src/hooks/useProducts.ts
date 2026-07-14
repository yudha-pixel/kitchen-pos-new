import { useState, useEffect } from 'react';
import * as api from '@/src/lib/api';
import { NetworkError } from '@/src/lib/api';
import { db, Product as DBProduct, Category as DBCategory, Modifier as DBModifier } from '@/src/lib/db';
import { Product, Category, UIModifierGroup } from '@/src/types/database.types';

/**
 * useProducts Hook with Offline-First Support
 *
 * Cache-first strategy:
 * 1. Load from IndexedDB (fast, works offline)
 * 2. If online, fetch fresh data from the local API and update IndexedDB
 * 3. If offline and no cache, show an error
 */
export const useProducts = (categoryId?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // FORCE: Always fetch from API, completely skip IndexedDB
      if (isOnline) {
        try {
          const data = await api.fetchProducts(categoryId);
          console.log('📡 API Response - Products:', data);
          console.log('📡 First product sample:', Array.isArray(data) && data.length > 0 ? data[0] : 'No data');

          if (Array.isArray(data) && data.length > 0) {
            setProducts(data as unknown as Product[]);
            setIsFromCache(false);
            console.log('✅ Products loaded from API:', data.length);
            console.log('✅ First product image_url:', (data[0] as any).image_url);
            console.log('✅ First product full object:', JSON.stringify(data[0], null, 2));
          } else if (data && !Array.isArray(data)) {
            console.warn('Unexpected products response format:', data);
          }
        } catch (err) {
          if (err instanceof NetworkError) {
            console.warn('API unreachable, no fallback available');
            setError('API unreachable and no cached data available');
          } else {
            throw err;
          }
        }
      } else {
        setError('Offline mode not available - API required');
      }
    } catch (err) {
      if (products.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      }
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts, isFromCache };
};

/**
 * useCategories Hook with Offline-First Support
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // FORCE: Always fetch from API, completely skip IndexedDB
      if (isOnline) {
        try {
          const data = await api.fetchCategories();
          console.log('📡 API Response - Categories:', data);

          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            setIsFromCache(false);
            console.log('✅ Categories loaded from API:', data.length);
          }
        } catch (err) {
          if (err instanceof NetworkError) {
            console.warn('API unreachable, no fallback available');
            setError('API unreachable and no cached data available');
          } else {
            throw err;
          }
        }
      } else {
        setError('Offline mode not available - API required');
      }
    } catch (err) {
      if (categories.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      }
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories, isFromCache };
};

/**
 * useModifiers Hook with Offline-First Support
 */
export const useModifiers = (productId: string) => {
  const [modifiers, setModifiers] = useState<UIModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchModifiers();
    }
  }, [productId]);

  async function fetchModifiers() {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // STEP 1: Load from cache
      try {
        const cachedModifiers = await db.modifiers
          .where('product_id')
          .equals(productId)
          .toArray();

        if (cachedModifiers.length > 0) {
          const uiGroup: UIModifierGroup = {
            id: productId,
            name: 'Modifiers',
            required: false,
            multiSelect: true,
            options: cachedModifiers.map((mod) => ({
              id: mod.id!,
              name: mod.name,
              price: mod.price_extra,
              selected: false,
            })),
          };
          setModifiers([uiGroup]);
          setIsFromCache(true);
          console.log('Loaded modifiers from IndexedDB cache');
        }
      } catch (cacheError) {
        console.warn('Failed to load modifiers from cache:', cacheError);
      }

      // STEP 2: Fetch from local API
      if (isOnline) {
        try {
          const data = await api.fetchModifiers(productId);

          if (Array.isArray(data)) {
            // Update IndexedDB cache
            try {
              await db.modifiers.where('product_id').equals(productId).delete();
              if (data.length > 0) {
                await db.modifiers.bulkPut(data as unknown as DBModifier[]);
              }
              console.log('Updated modifiers cache with fresh data');
            } catch (cacheError) {
              console.warn('Failed to update modifiers cache:', cacheError);
            }

            if (data.length > 0) {
              const typedData = data as unknown as Array<{ id: string; name: string; price_extra: number }>;
              const uiGroup: UIModifierGroup = {
                id: productId,
                name: 'Modifiers',
                required: false,
                multiSelect: true,
                options: typedData.map((mod) => ({
                  id: mod.id,
                  name: mod.name,
                  price: mod.price_extra,
                  selected: false,
                })),
              };
              setModifiers([uiGroup]);
            } else {
              setModifiers([]);
            }
            setIsFromCache(false);
          }
        } catch (err) {
          if (err instanceof NetworkError) {
            console.warn('API unreachable, using cached modifiers');
            setIsFromCache(true);
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      if (modifiers.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch modifiers');
      }
      console.error('Error fetching modifiers:', err);
    } finally {
      setLoading(false);
    }
  };

  return { modifiers, loading, error, refetch: fetchModifiers, isFromCache };
};
