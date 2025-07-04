// Modern request deduplication and caching system
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RequestCache {
  private pendingRequests = new Map<string, PendingRequest<unknown>>();
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxCacheSize = 500;

  /**
   * Deduplicate and cache API requests
   * @param key Unique key for the request
   * @param requestFn Function that makes the actual request
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   * @returns Promise with the data
   */
  async dedupe<T>(
    key: string, 
    requestFn: () => Promise<T>, 
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`🎯 Cache HIT for: ${key}`);
      return cached.data as T;
    }

    // Check if request is already in progress
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`⏳ Request DEDUPED for: ${key}`);
      return pending.promise as Promise<T>;
    }

    // Make new request
    console.log(`🚀 New REQUEST for: ${key}`);
    const promise = requestFn()
      .then((data) => {
        // Manage cache size
        this.ensureCacheSize();
        
        // Cache the result
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
        });
        
        // Remove from pending
        this.pendingRequests.delete(key);
        
        return data;
      })
      .catch((error) => {
        // Remove from pending on error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store as pending
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Ensure cache doesn't exceed max size
   */
  private ensureCacheSize(): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2)); // Remove 20%
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string | RegExp): void {
    const keys = Array.from(this.cache.keys());
    let invalidatedCount = 0;

    keys.forEach(key => {
      const shouldInvalidate = typeof pattern === 'string' 
        ? key.includes(pattern)
        : pattern.test(key);
      
      if (shouldInvalidate) {
        this.cache.delete(key);
        this.pendingRequests.delete(key);
        invalidatedCount++;
      }
    });

    console.log(`🗑️ Invalidated ${invalidatedCount} cache entries for pattern: ${pattern}`);
  }

  /**
   * Clear all cache and pending requests
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      maxCacheSize: this.maxCacheSize,
    };
  }
}

// Global singleton instance
export const requestCache = new RequestCache();

// Helper function to generate cache keys
export const createCacheKey = (endpoint: string, params?: Record<string, unknown>): string => {
  const paramString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
  return `${endpoint}${paramString}`;
};

// Request timeout helper
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};