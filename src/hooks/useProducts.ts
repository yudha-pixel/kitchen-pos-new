import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { db, Product as DBProduct, Category as DBCategory, Modifier as DBModifier } from '@/src/lib/db';
import { Product, Category, Modifier, UIModifierGroup, ModifierOption } from '@/src/types/database.types';

/**
 * useProducts Hook with Offline-First Support
 * 
 * This hook implements a cache-first strategy:
 * 1. First, try to load data from IndexedDB (fast, works offline)
 * 2. If online, fetch fresh data from Supabase and update IndexedDB cache
 * 3. If offline and no cached data, show appropriate error state
 * 
 * This ensures the app remains functional even without internet connection
 */
export const useProducts = (categoryId?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // STEP 1: Try to load from IndexedDB cache first (fast, works offline)
      try {
        let cachedProducts: DBProduct[] = [];
        
        if (categoryId) {
          cachedProducts = await db.products
            .where('category_id')
            .equals(categoryId)
            .toArray();
        } else {
          cachedProducts = await db.products.toArray();
        }

        if (cachedProducts.length > 0) {
          // Sort by name
          cachedProducts.sort((a, b) => a.name.localeCompare(b.name));
          setProducts(cachedProducts as Product[]);
          setIsFromCache(true);
          console.log('Loaded products from IndexedDB cache:', cachedProducts.length);
        }
      } catch (cacheError) {
        console.warn('Failed to load from cache:', cacheError);
        // Continue to fetch from Supabase
      }

      // STEP 2: If online, fetch fresh data from Supabase and update cache
      if (isOnline) {
        let query = supabase
          .from('products')
          .select('*, categories(name)')
          .order('name', { ascending: true });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform data to include category_name
          const productsWithCategory = data.map((product: any) => ({
            ...product,
            category_name: product.categories?.name || null
          }));

          // Update IndexedDB cache with fresh data
          try {
            // Clear old products for this category (or all if no category filter)
            if (categoryId) {
              const toDelete = await db.products
                .where('category_id')
                .equals(categoryId)
                .primaryKeys();
              if (toDelete.length > 0) {
                await db.products.bulkDelete(toDelete as string[]);
              }
            } else {
              await db.products.clear();
            }

            // Add fresh data to cache
            await db.products.bulkPut(productsWithCategory as DBProduct[]);
            console.log('Updated IndexedDB cache with fresh data:', productsWithCategory.length);
          } catch (cacheError) {
            console.warn('Failed to update cache:', cacheError);
            // Don't fail the whole operation if cache update fails
          }

          setProducts(productsWithCategory);
          setIsFromCache(false);
        }
      }
    } catch (err) {
      // If we have cached data, don't show error - just mark as from cache
      if (products.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } else {
        console.warn('Using cached data due to fetch error:', err);
        setIsFromCache(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts, isFromCache };
};

/**
 * useCategories Hook with Offline-First Support
 * 
 * Similar cache-first strategy for categories
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // STEP 1: Try to load from IndexedDB cache
      try {
        const cachedCategories = await db.categories.toArray();
        
        if (cachedCategories.length > 0) {
          // Sort by name
          cachedCategories.sort((a, b) => a.name.localeCompare(b.name));
          setCategories(cachedCategories as Category[]);
          setIsFromCache(true);
          console.log('Loaded categories from IndexedDB cache:', cachedCategories.length);
        }
      } catch (cacheError) {
        console.warn('Failed to load categories from cache:', cacheError);
      }

      // STEP 2: If online, fetch fresh data from Supabase
      if (isOnline) {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Update IndexedDB cache
          try {
            await db.categories.clear();
            await db.categories.bulkPut(data as DBCategory[]);
            console.log('Updated categories cache with fresh data:', data.length);
          } catch (cacheError) {
            console.warn('Failed to update categories cache:', cacheError);
          }

          setCategories(data);
          setIsFromCache(false);
        }
      }
    } catch (err) {
      if (categories.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } else {
        console.warn('Using cached categories due to fetch error:', err);
        setIsFromCache(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, refetch: fetchCategories, isFromCache };
};

/**
 * useModifiers Hook with Offline-First Support
 * 
 * Fetches modifiers for a specific product with caching
 * New schema: modifiers are directly linked to products (no modifier groups)
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

  const fetchModifiers = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // STEP 1: Try to load from IndexedDB cache
      try {
        const cachedModifiers = await db.modifiers
          .where('product_id')
          .equals(productId)
          .toArray();

        if (cachedModifiers.length > 0) {
          // Convert to UI format - group all modifiers under a single group
          const uiGroup: UIModifierGroup = {
            id: productId,
            name: 'Modifiers',
            options: cachedModifiers.map(mod => ({
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

      // STEP 2: If online, fetch fresh data from Supabase
      if (isOnline) {
        const { data, error } = await supabase
          .from('modifiers')
          .select('*')
          .eq('product_id', productId)
          .order('name', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Update IndexedDB cache
          try {
            await db.modifiers
              .where('product_id')
              .equals(productId)
              .delete();
            await db.modifiers.bulkPut(data as DBModifier[]);
            console.log('Updated modifiers cache with fresh data');
          } catch (cacheError) {
            console.warn('Failed to update modifiers cache:', cacheError);
          }

          // Convert to UI format
          const uiGroup: UIModifierGroup = {
            id: productId,
            name: 'Modifiers',
            options: data.map(mod => ({
              id: mod.id,
              name: mod.name,
              price: mod.price_extra,
              selected: false,
            })),
          };

          setModifiers([uiGroup]);
          setIsFromCache(false);
        } else {
          setModifiers([]);
        }
      }
    } catch (err) {
      if (modifiers.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch modifiers');
        console.error('Error fetching modifiers:', err);
      } else {
        console.warn('Using cached modifiers due to fetch error:', err);
        setIsFromCache(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return { modifiers, loading, error, refetch: fetchModifiers, isFromCache };
};
