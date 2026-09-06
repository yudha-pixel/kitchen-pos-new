declare module 'lru-cache' {
  interface LRUCacheOptions {
    max?: number;
    maxAge?: number;
    stale?: boolean;
    updateAgeOnGet?: boolean;
  }

  interface LRUCacheConstructor {
    new (options?: LRUCacheOptions): {
      get(key: string): unknown;
      set(key: string, value: unknown): void;
      del(key: string): void;
      reset(): void;
    };
  }

  const LRU: LRUCacheConstructor;
  export default LRU;
}
