import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DemoRole = 'buyer' | 'business' | 'admin';
export type NetworkState = 'connected' | 'slow' | 'offline';
export type GatedActionType = 'message' | 'offer' | 'chat' | 'favorite' | null;

export interface FeatureFlags {
  ENABLE_MONETIZATION: boolean;
  ENABLE_JOBS: boolean;
  ENABLE_AUCTIONS: boolean;
  ENABLE_BARTER: boolean;
}

interface AppContextValue {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  compareList: string[];
  toggleCompare: (id: string) => void;
  isComparing: (id: string) => boolean;
  clearCompare: () => void;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  demoRole: DemoRole;
  setDemoRole: (role: DemoRole) => void;
  dataSaver: boolean;
  setDataSaver: (on: boolean) => void;
  networkState: NetworkState;
  setNetworkState: (state: NetworkState) => void;
  savedSearches: { id: string; query: string; queryAr: string; alerts: boolean }[];
  addSavedSearch: (query: string, queryAr: string) => void;
  removeSavedSearch: (id: string) => void;
  myListings: string[];
  addMyListing: (id: string) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  appliedJobs: { jobId: string; status: string; date: string }[];
  applyToJob: (jobId: string) => void;
  savedJobs: string[];
  toggleSavedJob: (jobId: string) => void;
  location: { cityId: string; areaId: string };
  setLocation: (v: { cityId: string; areaId: string }) => void;
  featureFlags: FeatureFlags;
  setFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  gatedAction: GatedActionType;
  showAuthGate: (action: GatedActionType) => void;
  hideAuthGate: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

type SetStateFn<T> = (v: T | ((prev: T) => T)) => void;
function usePersistentState<T>(key: string, initial: T): [T, SetStateFn<T>] {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState as SetStateFn<T>];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = usePersistentState<string[]>('marbou-favorites', []);
  const [compareList, setCompareList] = usePersistentState<string[]>('marbou-compare', []);
  const [recentlyViewed, setRecentlyViewed] = usePersistentState<string[]>('marbou-recent', []);
  const [demoRole, setDemoRole] = usePersistentState<DemoRole>('marbou-role', 'buyer');
  const [dataSaver, setDataSaver] = usePersistentState<boolean>('marbou-datasaver', false);
  const [networkState, setNetworkState] = usePersistentState<NetworkState>('marbou-network', 'connected');
  const [savedSearches, setSavedSearches] = usePersistentState<any[]>('marbou-searches', []);
  const [myListings, setMyListings] = usePersistentState<string[]>('marbou-mylistings', ['lst-030']);
  const [appliedJobs, setAppliedJobs] = usePersistentState<any[]>('marbou-appliedJobs', []);
  const [savedJobs, setSavedJobs] = usePersistentState<string[]>('marbou-savedJobs', []);
  const [location, setLocation] = usePersistentState<{ cityId: string; areaId: string }>('marbou-location', { cityId: 'khartoum', areaId: 'riyadh' });
  const [featureFlags, setFeatureFlagsState] = usePersistentState<FeatureFlags>('marbou-flags', {
    ENABLE_MONETIZATION: true,
    ENABLE_JOBS: true,
    ENABLE_AUCTIONS: false,
    ENABLE_BARTER: false,
  });
  const [gatedAction, setGatedAction] = useState<GatedActionType>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };
  const isFavorite = (id: string) => favorites.includes(id);

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };
  const isComparing = (id: string) => compareList.includes(id);
  const clearCompare = () => setCompareList([]);

  const addRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => [id, ...prev.filter((p) => p !== id)].slice(0, 20));
  };

  const addSavedSearch = (query: string, queryAr: string) => {
    setSavedSearches((prev) => [...prev, { id: Date.now().toString(), query, queryAr, alerts: false }]);
  };
  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const addMyListing = (id: string) => {
    setMyListings((prev) => [id, ...prev.filter((l) => l !== id)]);
  };

  const applyToJob = (jobId: string) => {
    setAppliedJobs((prev) => {
      if (prev.some((j) => j.jobId === jobId)) return prev;
      return [...prev, { jobId, status: 'new', date: new Date().toISOString() }];
    });
  };

  const toggleSavedJob = (jobId: string) => {
    setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((j) => j !== jobId) : [...prev, jobId]));
  };

  const setFeatureFlags = (flags: Partial<FeatureFlags>) => {
    setFeatureFlagsState((prev) => ({ ...prev, ...flags }));
  };

  const showAuthGate = (action: GatedActionType) => {
    setGatedAction(action);
  };

  const hideAuthGate = () => {
    setGatedAction(null);
  };

  return (
    <AppContext.Provider
      value={{
        favorites, toggleFavorite, isFavorite,
        compareList, toggleCompare, isComparing, clearCompare,
        recentlyViewed, addRecentlyViewed,
        demoRole, setDemoRole,
        dataSaver, setDataSaver,
        networkState, setNetworkState,
        savedSearches, addSavedSearch, removeSavedSearch,
        myListings, addMyListing,
        toast, showToast,
        appliedJobs, applyToJob,
        savedJobs, toggleSavedJob,
        location, setLocation,
        featureFlags, setFeatureFlags,
        gatedAction, showAuthGate, hideAuthGate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
