declare module 'lru-cache' {
  interface LRUCacheOptions {
    max?: number;
    maxAge?: number;
    stale?: boolean;
    updateAgeOnGet?: boolean;
  }

  interface LRUCacheConstructor {
    new (options?: LRUCacheOptions): {
      get(key: string): any;
      set(key: string, value: any): void;
      del(key: string): void;
      reset(): void;
    };
  }

  const LRU: LRUCacheConstructor;
  export default LRU;
}
