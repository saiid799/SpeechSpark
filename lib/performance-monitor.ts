// Performance monitoring and request throttling
import { requestCache } from "./request-cache";

interface PerformanceMetric {
  endpoint: string;
  duration: number;
  timestamp: number;
  cacheHit: boolean;
  userId?: string;
}

interface ThrottleEntry {
  count: number;
  resetTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;
  private throttleMap = new Map<string, ThrottleEntry>();
  
  // Throttle limits per endpoint per user
  private throttleLimits = {
    '/api/user': { requests: 10, windowMs: 60000 }, // 10 requests per minute
    '/api/words': { requests: 20, windowMs: 60000 }, // 20 requests per minute
    '/api/words/generate': { requests: 3, windowMs: 300000 }, // 3 requests per 5 minutes
    '/api/words/learned': { requests: 5, windowMs: 60000 }, // 5 requests per minute
  };

  /**
   * Record a performance metric
   */
  recordMetric(
    endpoint: string, 
    duration: number, 
    cacheHit: boolean = false, 
    userId?: string
  ): void {
    this.metrics.push({
      endpoint,
      duration,
      timestamp: Date.now(),
      cacheHit,
      userId,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (duration > 3000) {
      console.warn(`🐌 SLOW REQUEST: ${endpoint} took ${duration}ms`);
    } else if (duration > 1000) {
      console.log(`⚠️ Slow request: ${endpoint} took ${duration}ms`);
    } else if (cacheHit) {
      console.log(`🎯 Cache hit: ${endpoint} served in ${duration}ms`);
    }
  }

  /**
   * Check if request should be throttled
   */
  shouldThrottle(endpoint: string, userId: string): boolean {
    const limit = this.throttleLimits[endpoint as keyof typeof this.throttleLimits];
    if (!limit) return false;

    const key = `${endpoint}:${userId}`;
    const now = Date.now();
    const entry = this.throttleMap.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.throttleMap.set(key, {
        count: 1,
        resetTime: now + limit.windowMs,
      });
      return false;
    }

    if (entry.count >= limit.requests) {
      console.warn(`🚫 THROTTLED: ${endpoint} for user ${userId} (${entry.count}/${limit.requests})`);
      return true;
    }

    entry.count++;
    return false;
  }

  /**
   * Get performance statistics
   */
  getStats(endpointFilter?: string) {
    const filteredMetrics = endpointFilter 
      ? this.metrics.filter(m => m.endpoint.includes(endpointFilter))
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        slowRequests: 0,
      };
    }

    const totalRequests = filteredMetrics.length;
    const averageResponseTime = Math.round(
      filteredMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
    );
    const cacheHits = filteredMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = Math.round((cacheHits / totalRequests) * 100);
    const slowRequests = filteredMetrics.filter(m => m.duration > 1000).length;

    return {
      totalRequests,
      averageResponseTime,
      cacheHitRate,
      slowRequests,
      recentMetrics: filteredMetrics.slice(-10),
    };
  }

  /**
   * Get endpoint breakdown
   */
  getEndpointBreakdown() {
    const breakdown = new Map<string, { count: number; avgTime: number; slowCount: number }>();

    this.metrics.forEach(metric => {
      const existing = breakdown.get(metric.endpoint) || { count: 0, avgTime: 0, slowCount: 0 };
      existing.count++;
      existing.avgTime = ((existing.avgTime * (existing.count - 1)) + metric.duration) / existing.count;
      if (metric.duration > 1000) existing.slowCount++;
      breakdown.set(metric.endpoint, existing);
    });

    return Array.from(breakdown.entries()).map(([endpoint, stats]) => ({
      endpoint,
      ...stats,
      avgTime: Math.round(stats.avgTime),
    }));
  }

  /**
   * Clear old metrics and throttle entries
   */
  cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    // Clean old metrics
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    
    // Clean expired throttle entries
    const now = Date.now();
    for (const [key, entry] of this.throttleMap.entries()) {
      if (now > entry.resetTime) {
        this.throttleMap.delete(key);
      }
    }
  }

  /**
   * Log periodic performance summary
   */
  logSummary(): void {
    const stats = this.getStats();
    const cacheStats = requestCache.getStats();
    
    console.log(`📊 Performance Summary:`);
    console.log(`   • Total requests: ${stats.totalRequests}`);
    console.log(`   • Avg response time: ${stats.averageResponseTime}ms`);
    console.log(`   • Cache hit rate: ${stats.cacheHitRate}%`);
    console.log(`   • Slow requests: ${stats.slowRequests}`);
    console.log(`   • Cache size: ${cacheStats.cacheSize}`);
    console.log(`   • Pending requests: ${cacheStats.pendingRequests}`);
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Automatic cleanup every 10 minutes
setInterval(() => {
  performanceMonitor.cleanup();
}, 10 * 60 * 1000);

// Log summary every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    performanceMonitor.logSummary();
  }, 5 * 60 * 1000);
}

// Helper to measure API endpoint performance
export const measureApiPerformance = async <T>(
  endpoint: string,
  operation: () => Promise<T>,
  userId?: string
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    performanceMonitor.recordMetric(endpoint, duration, false, userId);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    performanceMonitor.recordMetric(endpoint, duration, false, userId);
    throw error;
  }
};