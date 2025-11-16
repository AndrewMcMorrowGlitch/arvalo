/**
 * Simple in-memory cache for agent results
 * Reduces redundant API calls and improves performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AgentCache {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Store data in cache with TTL (time to live) in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = 3600000): void {
    // Default TTL: 1 hour
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Retrieve data from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Expired, remove from cache
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove entry from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    oldestEntry: number;
    newestEntry: number;
  } {
    let oldestEntry = Date.now();
    let newestEntry = 0;

    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldestEntry) oldestEntry = entry.timestamp;
      if (entry.timestamp > newestEntry) newestEntry = entry.timestamp;
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry,
      newestEntry,
    };
  }
}

// Singleton instance
export const agentCache = new AgentCache();

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  // Server-side only
  setInterval(
    () => {
      agentCache.cleanup();
    },
    5 * 60 * 1000
  );
}
