/**
 * Cache key type for type-safe cache configuration.
 * Represents all valid cache keys used throughout the application.
 */
export type CacheKey = 'listings' | 'categories' | 'profile' | 'search';

/**
 * Cache configuration entry defining stale and garbage collection times.
 */
export interface CacheConfigEntry {
  /**
   * Time in milliseconds after which cached data is considered stale
   * but can still be returned if no fresh data is available.
   * Useful for background refetches.
   */
  staleTime: number;

  /**
   * Time in milliseconds after which cached data is garbage collected
   * and removed from memory entirely. Must be >= staleTime.
   */
  gcTime: number;
}

/**
 * Cache configuration for different data types in the marketplace.
 * Defines stale times and garbage collection intervals to optimize
 * performance for high-traffic scenarios with thousands of users.
 *
 * Stale Time: How long to consider data "fresh" before background refetch
 * GC Time: How long to keep data in cache before removing it entirely
 */
export const CACHE_CONFIG: Record<CacheKey, CacheConfigEntry> = {
  /**
   * Listings cache: frequently changing data with high read volume.
   * 5 minutes stale time (users see recent data without constant refetch)
   * 30 minutes GC time (garbage collect rarely accessed listings)
   */
  listings: {
    staleTime: 5 * 60 * 1000,    // 5 minutes
    gcTime: 30 * 60 * 1000,      // 30 minutes
  },

  /**
   * Categories cache: relatively static data, shared across all users.
   * 30 minutes stale time (categories rarely change)
   * 2 hours GC time (keep in cache long-term for frequently accessed category data)
   */
  categories: {
    staleTime: 30 * 60 * 1000,   // 30 minutes
    gcTime: 2 * 60 * 60 * 1000,  // 2 hours
  },

  /**
   * Profile cache: user-specific data with moderate change frequency.
   * 10 minutes stale time (balance between freshness and server load)
   * 1 hour GC time (user session typically lasts longer)
   */
  profile: {
    staleTime: 10 * 60 * 1000,   // 10 minutes
    gcTime: 60 * 60 * 1000,      // 1 hour
  },

  /**
   * Search cache: user-generated queries with high variability.
   * 2 minutes stale time (search results change frequently with user additions)
   * 15 minutes GC time (garbage collect old search queries quickly)
   */
  search: {
    staleTime: 2 * 60 * 1000,    // 2 minutes
    gcTime: 15 * 60 * 1000,      // 15 minutes
  },
};
