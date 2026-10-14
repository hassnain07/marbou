import { useState, useEffect } from 'react';

/**
 * Network state type representing the user's current connectivity status.
 * 'connected': Normal connectivity (LTE, WiFi, broadband)
 * 'slow': 2G or 3G connection with limited bandwidth
 * 'offline': No network connection
 */
export type NetworkState = 'connected' | 'slow' | 'offline';

/**
 * Effective connection type from the Network Information API.
 * Describes the effective bandwidth and latency characteristics.
 */
type EffectiveType = '4g' | '3g' | '2g' | 'slow-2g';

/**
 * Hook to detect current network state and connectivity status.
 * Monitors navigator.onLine and connection.effectiveType for real-time updates.
 * Useful for adaptive UI that degrades gracefully on weak connections.
 *
 * @returns Current network state: 'connected', 'slow', or 'offline'
 *
 * @example
 * const networkState = useNetworkState();
 * if (networkState === 'offline') {
 *   return <OfflineMessage />;
 * }
 * if (networkState === 'slow') {
 *   return <LowBandwidthVersion />;
 * }
 * return <NormalVersion />;
 */
export function useNetworkState(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>(() => {
    // Initialize based on current online status
    if (!navigator.onLine) {
      return 'offline';
    }

    // Check effective connection type if available
    const connection = (navigator as unknown as { connection?: { effectiveType: EffectiveType } }).connection;
    if (connection?.effectiveType) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g') {
        return 'slow';
      }
    }

    return 'connected';
  });

  useEffect(() => {
    /**
     * Handle online/offline state changes.
     */
    const handleOnline = (): void => {
      const connection = (navigator as unknown as { connection?: { effectiveType: EffectiveType } }).connection;
      if (connection?.effectiveType) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g') {
          setNetworkState('slow');
          return;
        }
      }
      setNetworkState('connected');
    };

    const handleOffline = (): void => {
      setNetworkState('offline');
    };

    /**
     * Handle effective connection type changes (when network quality changes).
     */
    const handleConnectionChange = (): void => {
      if (!navigator.onLine) {
        setNetworkState('offline');
        return;
      }

      const connection = (navigator as unknown as { connection?: { effectiveType: EffectiveType } }).connection;
      if (connection?.effectiveType) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g') {
          setNetworkState('slow');
          return;
        }
      }
      setNetworkState('connected');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Add connection change listener if supported
    const connection = (navigator as unknown as { connection?: { addEventListener?: (event: string, handler: () => void) => void } }).connection;
    if (connection?.addEventListener) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup event listeners
    return (): void => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connection?.addEventListener) {
        // Note: removeEventListener is not standard for connection object,
        // but we attempt it for completeness
        try {
          (connection as unknown as { removeEventListener?: (event: string, handler: () => void) => void }).removeEventListener?.('change', handleConnectionChange);
        } catch {
          // Silently ignore if removeEventListener is not supported
        }
      }
    };
  }, []);

  return networkState;
}

/**
 * Hook to detect if user has enabled Data Saver mode or localStorage preference.
 * Returns true if data saving mode is active, allowing the app to reduce image quality,
 * disable auto-play videos, and skip non-essential requests.
 *
 * @returns True if data saver mode is enabled, false otherwise
 *
 * @example
 * const isDataSaver = useDataSaver();
 * if (isDataSaver) {
 *   return <LowDataImages />;
 * }
 * return <HighQualityImages />;
 */
export function useDataSaver(): boolean {
  const [isDataSaver, setIsDataSaver] = useState<boolean>(() => {
    // Check for localStorage preference first
    const localPref = localStorage.getItem('dataSaver');
    if (localPref !== null) {
      return localPref === 'true';
    }

    // Fall back to navigator.connection.saveData if available
    const connection = (navigator as unknown as { connection?: { saveData: boolean } }).connection;
    return connection?.saveData ?? false;
  });

  useEffect(() => {
    /**
     * Handle storage changes from other tabs/windows.
     */
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === 'dataSaver' && event.newValue !== null) {
        setIsDataSaver(event.newValue === 'true');
      }
    };

    /**
     * Handle connection change to detect saveData mode changes.
     */
    const handleConnectionChange = (): void => {
      const localPref = localStorage.getItem('dataSaver');
      if (localPref !== null) {
        setIsDataSaver(localPref === 'true');
        return;
      }

      const connection = (navigator as unknown as { connection?: { saveData: boolean } }).connection;
      setIsDataSaver(connection?.saveData ?? false);
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);

    const connection = (navigator as unknown as { connection?: { addEventListener?: (event: string, handler: () => void) => void } }).connection;
    if (connection?.addEventListener) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup event listeners
    return (): void => {
      window.removeEventListener('storage', handleStorageChange);

      if (connection?.addEventListener) {
        try {
          (connection as unknown as { removeEventListener?: (event: string, handler: () => void) => void }).removeEventListener?.('change', handleConnectionChange);
        } catch {
          // Silently ignore if removeEventListener is not supported
        }
      }
    };
  }, []);

  return isDataSaver;
}

/**
 * Calculates exponential backoff delay for retry attempts.
 * Starts at 1 second and doubles with each attempt, capped at 30 seconds maximum.
 * Useful for implementing robust retry logic for API calls and data fetching.
 *
 * Delay progression: 1s -> 2s -> 4s -> 8s -> 16s -> 30s (capped)
 *
 * @param attempt - The retry attempt number (1-indexed: first attempt = 1)
 * @returns Delay in milliseconds before the next retry attempt
 *
 * @example
 * const delay = getRetryDelay(1);  // 1000ms
 * const delay = getRetryDelay(2);  // 2000ms
 * const delay = getRetryDelay(4);  // 8000ms
 * const delay = getRetryDelay(10); // 30000ms (capped)
 *
 * // Usage in retry logic:
 * async function fetchWithRetry(url: string, maxAttempts = 5): Promise<Response> {
 *   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
 *     try {
 *       return await fetch(url);
 *     } catch (error) {
 *       if (attempt === maxAttempts) throw error;
 *       const delay = getRetryDelay(attempt);
 *       await new Promise(resolve => setTimeout(resolve, delay));
 *     }
 *   }
 *   throw new Error('Failed after max attempts');
 * }
 */
export function getRetryDelay(attempt: number): number {
  // Base delay: 1 second (1000ms)
  const baseDelay = 1000;

  // Calculate exponential backoff: 2^(attempt - 1) * baseDelay
  // Attempt 1: 2^0 * 1000 = 1000ms
  // Attempt 2: 2^1 * 1000 = 2000ms
  // Attempt 3: 2^2 * 1000 = 4000ms
  // Attempt 4: 2^3 * 1000 = 8000ms
  // etc.
  const exponentialDelay = Math.pow(2, attempt - 1) * baseDelay;

  // Cap at 30 seconds (30000ms) to avoid excessive delays
  const maxDelay = 30000;

  return Math.min(exponentialDelay, maxDelay);
}
