import axios from 'axios';
import type { ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache TTL

/**
 * Get cached response or fetch and cache
 * @param url - The API endpoint URL
 * @param fetcher - Function that returns a promise with the data
 * @returns Cached or fresh data
 */
export const getCached = async <T>(url: string, fetcher: () => Promise<T>): Promise<T> => {
  const cached = cache.get(url);
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  
  // Fetch fresh data and cache it
  const data = await fetcher();
  cache.set(url, { data, timestamp: now });
  return data;
};

/**
 * Clear cache for a specific URL or all cache
 * @param url - Optional URL to clear specific cache entry
 */
export const clearCache = (url?: string) => {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
};

export default client;

