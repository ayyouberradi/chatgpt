// src/lib/rateLimit.ts

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const getStorageKey = (action: string) => `rl_${action}`;

/**
 * Client-side rate limiting utility
 * @param action The action to rate limit (e.g., 'contact_form', 'login')
 * @param maxAttempts Maximum allowed attempts
 * @param windowMs Time window in milliseconds
 * @returns boolean true if allowed, false if rate limited
 */
export const checkRateLimit = (action: string, maxAttempts: number = 3, windowMs: number = 60000): boolean => {
  try {
    const key = getStorageKey(action);
    const now = Date.now();
    const stored = localStorage.getItem(key);

    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }

    const entry: RateLimitEntry = JSON.parse(stored);

    if (now > entry.resetTime) {
      // Reset window
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }

    if (entry.count >= maxAttempts) {
      return false; // Rate limited
    }

    // Increment count
    localStorage.setItem(key, JSON.stringify({ count: entry.count + 1, resetTime: entry.resetTime }));
    return true;
  } catch (error) {
    // If local storage fails, allow by default but log error
    console.error('Rate limit error:', error);
    return true;
  }
};
