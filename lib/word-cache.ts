/**
 * Word caching system with memory fallback
 * 
 * This module provides caching for frequently requested words and generated content.
 * It uses Redis when available, falls back to in-memory cache otherwise.
 */

interface CachedWord {
  id: string;
  original: string;
  translation: string;
  learned: boolean;
  proficiencyLevel: string;
  learningLanguage: string;
  nativeLanguage: string;
  userId: string;
  createdAt: Date;
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds, default 1 hour
}

// In-memory cache as fallback
class MemoryCache {
  private cache = new Map<string, { data: unknown; expiry: number }>();

  set(key: string, value: unknown, ttlSeconds: number = 3600): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expiry });
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache();

// Run cleanup every 5 minutes
setInterval(() => {
  memoryCache.cleanup();
}, 5 * 60 * 1000);

/**
 * Cache implementation that uses Redis if available, memory cache otherwise
 */
class WordCache {
  protected isRedisAvailable = false;

  constructor() {
    // Check if Redis is available in the environment
    this.checkRedisAvailability();
  }

  private async checkRedisAvailability(): Promise<void> {
    try {
      // Try to connect to Redis if environment variable is set
      if (process.env.REDIS_URL) {
        // We'll implement Redis connection later
        // For now, use memory cache
        this.isRedisAvailable = false;
      }
    } catch {
      console.log('Redis not available, using memory cache');
      this.isRedisAvailable = false;
    }
  }

  async set(key: string, value: unknown, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 3600; // Default 1 hour

    if (this.isRedisAvailable) {
      // TODO: Implement Redis caching
      // await redisClient.setex(key, ttl, JSON.stringify(value));
    } else {
      memoryCache.set(key, value, ttl);
    }
  }

  async get(key: string): Promise<unknown | null> {
    if (this.isRedisAvailable) {
      // TODO: Implement Redis caching
      // const result = await redisClient.get(key);
      // return result ? JSON.parse(result) : null;
      return null;
    } else {
      return memoryCache.get(key);
    }
  }

  async delete(key: string): Promise<void> {
    if (this.isRedisAvailable) {
      // TODO: Implement Redis caching
      // await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isRedisAvailable) {
      // TODO: Implement Redis caching
      // await redisClient.flushall();
    } else {
      memoryCache.clear();
    }
  }

  // Generate cache keys
  getUserWordsKey(userId: string, level?: string): string {
    return `user_words:${userId}${level ? `:${level}` : ''}`;
  }

  getLearnedWordsKey(userId: string): string {
    return `learned_words:${userId}`;
  }

  getWordCountKey(userId: string, level: string): string {
    return `word_count:${userId}:${level}`;
  }

  getGeneratedWordsKey(language: string, level: string, count: number): string {
    return `generated:${language}:${level}:${count}`;
  }

  getBatchKey(userId: string, level: string, batchNumber: number): string {
    return `batch:${userId}:${level}:${batchNumber}`;
  }

  getBatchStatsKey(userId: string, level: string): string {
    return `batch_stats:${userId}:${level}`;
  }
}

// Cache specific methods for word operations
export class WordCacheService extends WordCache {
  // Cache user's words for a specific level
  async cacheUserWords(
    userId: string, 
    level: string, 
    words: CachedWord[],
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.getUserWordsKey(userId, level);
    await this.set(key, words, { ttl: options.ttl || 1800 }); // 30 minutes
  }

  // Get cached user words
  async getCachedUserWords(userId: string, level: string): Promise<CachedWord[] | null> {
    const key = this.getUserWordsKey(userId, level);
    const result = await this.get(key);
    return result as CachedWord[] | null;
  }

  // Cache learned words
  async cacheLearnedWords(
    userId: string, 
    words: CachedWord[],
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.getLearnedWordsKey(userId);
    await this.set(key, words, { ttl: options.ttl || 900 }); // 15 minutes
  }

  // Get cached learned words
  async getCachedLearnedWords(userId: string): Promise<CachedWord[] | null> {
    const key = this.getLearnedWordsKey(userId);
    const result = await this.get(key);
    return result as CachedWord[] | null;
  }

  // Cache word count for performance
  async cacheWordCount(
    userId: string, 
    level: string, 
    count: number,
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.getWordCountKey(userId, level);
    await this.set(key, count, { ttl: options.ttl || 3600 }); // 1 hour
  }

  // Get cached word count
  async getCachedWordCount(userId: string, level: string): Promise<number | null> {
    const key = this.getWordCountKey(userId, level);
    const result = await this.get(key);
    return result as number | null;
  }

  // Cache generated words for reuse across users
  async cacheGeneratedWords(
    language: string,
    level: string,
    count: number,
    words: { original: string; translation: string }[],
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.getGeneratedWordsKey(language, level, count);
    await this.set(key, words, { ttl: options.ttl || 7200 }); // 2 hours
  }

  // Get cached generated words
  async getCachedGeneratedWords(
    language: string,
    level: string,
    count: number
  ): Promise<{ original: string; translation: string }[] | null> {
    const key = this.getGeneratedWordsKey(language, level, count);
    const result = await this.get(key);
    return result as { original: string; translation: string }[] | null;
  }

  // Cache batch words
  async cacheBatchWords(
    userId: string,
    level: string,
    batchNumber: number,
    words: CachedWord[],
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.getBatchKey(userId, level, batchNumber);
    await this.set(key, words, { ttl: options.ttl || 1800 }); // 30 minutes
  }

  // Get cached batch words
  async getCachedBatchWords(
    userId: string,
    level: string,
    batchNumber: number
  ): Promise<CachedWord[] | null> {
    const key = this.getBatchKey(userId, level, batchNumber);
    const result = await this.get(key);
    return result as CachedWord[] | null;
  }

  // Cache batch statistics
  async cacheBatchStats(
    userId: string,
    level: string,
    stats: unknown,
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.getBatchStatsKey(userId, level);
    await this.set(key, stats, { ttl: options.ttl || 900 }); // 15 minutes
  }

  // Get cached batch statistics
  async getCachedBatchStats(userId: string, level: string): Promise<unknown | null> {
    const key = this.getBatchStatsKey(userId, level);
    const result = await this.get(key);
    return result;
  }

  // Invalidate user-specific caches when word is learned/updated
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      this.getUserWordsKey(userId),
      this.getLearnedWordsKey(userId),
    ];

    for (const pattern of patterns) {
      await this.delete(pattern);
    }

    // Also invalidate level-specific and batch-specific caches
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of levels) {
      await this.delete(this.getUserWordsKey(userId, level));
      await this.delete(this.getWordCountKey(userId, level));
      await this.delete(this.getBatchStatsKey(userId, level));
      
      // Invalidate batch caches (up to 20 batches per level)
      for (let batchNumber = 1; batchNumber <= 20; batchNumber++) {
        await this.delete(this.getBatchKey(userId, level, batchNumber));
      }
    }
  }

  // Invalidate specific batch cache
  async invalidateBatchCache(userId: string, level: string, batchNumber: number): Promise<void> {
    await this.delete(this.getBatchKey(userId, level, batchNumber));
    await this.delete(this.getBatchStatsKey(userId, level));
    await this.delete(this.getUserWordsKey(userId, level));
    await this.delete(this.getLearnedWordsKey(userId));
  }

  // Get cache statistics
  getStats(): { 
    type: 'memory' | 'redis'; 
    size: number;
    memoryUsage?: string;
  } {
    if (this.isRedisAvailable) {
      return { type: 'redis', size: 0 }; // TODO: Implement Redis stats
    } else {
      const memSize = memoryCache.size();
      return { 
        type: 'memory', 
        size: memSize,
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      };
    }
  }
}

// Export singleton instance
export const wordCache = new WordCacheService();

// Export cache invalidation helpers
export const invalidateWordCache = {
  user: (userId: string) => wordCache.invalidateUserCache(userId),
  batch: (userId: string, level: string, batchNumber: number) => wordCache.invalidateBatchCache(userId, level, batchNumber),
  all: () => wordCache.clear(),
};