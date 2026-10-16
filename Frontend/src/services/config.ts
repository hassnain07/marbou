/**
 * Feature flags and configuration service
 * Manages runtime flags for monetization, moderation, and experimental features
 */

export interface FeatureFlags {
  // Monetization: pricing, promotions, payment UI
  monetizationEnabled: boolean;
  // Pre-moderation: review step before publish
  preModeration: boolean;
  // Admin features: debug panels, role switchers
  adminDebugMode: boolean;
}

class ConfigService {
  private flags: FeatureFlags;
  private lastRefresh: number = 0;
  private refreshInterval: number = 60000; // 60 seconds

  constructor() {
    // Default flags (all monetization features OFF for MVP)
    this.flags = {
      monetizationEnabled: false,
      preModeration: false,
      adminDebugMode: import.meta.env.DEV, // Only in dev
    };
    this.loadFromStorage();
  }

  /**
   * Get current flags, refreshing from backend if stale
   */
  async getFlags(): Promise<FeatureFlags> {
    const now = Date.now();
    if (now - this.lastRefresh > this.refreshInterval) {
      await this.refresh();
    }
    return { ...this.flags };
  }

  /**
   * Refresh flags from backend (mock for now, real backend replaces this)
   */
  private async refresh(): Promise<void> {
    try {
      // TODO: Replace with real backend call
      // const response = await fetch('/api/config/flags', { headers: { Authorization: `Bearer ${getToken()}` } });
      // const data = await response.json();
      // this.flags = data;

      // Mock: always disable monetization for MVP
      this.flags.monetizationEnabled = false;
      this.flags.preModeration = false;

      this.lastRefresh = Date.now();
      this.saveToStorage();
    } catch (error) {
      console.error('Failed to refresh flags:', error);
      // Fall back to stored flags on error
    }
  }

  /**
   * Check if a specific flag is enabled
   */
  async isEnabled(flagName: keyof FeatureFlags): Promise<boolean> {
    const flags = await this.getFlags();
    return flags[flagName] ?? false;
  }

  /**
   * Load flags from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('marbou_flags');
      if (stored) {
        this.flags = { ...this.flags, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors, use defaults
    }
  }

  /**
   * Save flags to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('marbou_flags', JSON.stringify(this.flags));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Override a flag (admin/testing only)
   */
  setFlag(flagName: keyof FeatureFlags, value: boolean): void {
    if (!import.meta.env.DEV) return; // Only in dev
    this.flags[flagName] = value;
    this.saveToStorage();
  }
}

export const configService = new ConfigService();
