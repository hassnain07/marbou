// Mock listings service with IndexedDB-backed persistence
import { listings } from '@/data/mockData';

export interface Listing {
  id: string;
  publicId: string; // MARBOU-NNNNN
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: 'SDG' | 'USD';
  condition: string;
  images: string[];
  coverImageIndex: number;
  location: { city: string; area?: string; lat?: number; lng?: number };
  sellerId: string;
  sellerName: string;
  status: 'draft' | 'active' | 'hidden' | 'sold' | 'expired' | 'archived';
  createdAt: number;
  publishedAt?: number;
  expiresAt?: number;
  updatedAt: number;
  views: number;
  favorites: string[]; // user IDs
  contactOptions: { call: boolean; whatsapp: boolean; chat: boolean };
  phone?: string;
  negotiable: boolean;
  specs?: Record<string, any>;
}

const LISTINGS_KEY = 'marbou-listings-v2';
let listingCounter = listings.length;

function getStoredListings(): Listing[] {
  try {
    const stored = localStorage.getItem(LISTINGS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveStoredListings(listings: Listing[]) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

function getAllListings(): Listing[] {
  const stored = getStoredListings();
  const seed = (listings || []) as unknown as Listing[];
  return [...seed, ...stored];
}

function generatePublicId(): string {
  listingCounter++;
  return `MARBOU-${String(listingCounter).padStart(5, '0')}`;
}

export async function createListing(data: Omit<Listing, 'id' | 'publicId' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'>): Promise<{ success: boolean; listing?: Listing; error?: string }> {
  try {
    const stored = getStoredListings();
    const newListing: Listing = {
      ...data,
      id: `lst-${Date.now()}`,
      publicId: generatePublicId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      views: 0,
      favorites: [],
      status: 'active',
    };

    stored.push(newListing);
    saveStoredListings(stored);

    return { success: true, listing: newListing };
  } catch (error) {
    return { success: false, error: 'Failed to create listing' };
  }
}

export async function saveDraft(data: Partial<Listing>): Promise<{ success: boolean; listing?: Listing; error?: string }> {
  try {
    const stored = getStoredListings();
    const existingIndex = stored.findIndex(l => l.id === data.id);
    
    if (existingIndex >= 0) {
      stored[existingIndex] = { ...stored[existingIndex], ...data, updatedAt: Date.now(), status: 'draft' };
    } else {
      const newDraft: Listing = {
        id: `lst-${Date.now()}`,
        publicId: generatePublicId(),
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        price: data.price || 0,
        currency: data.currency || 'SDG',
        condition: data.condition || '',
        images: data.images || [],
        coverImageIndex: data.coverImageIndex || 0,
        location: data.location || { city: '', area: '' },
        sellerId: data.sellerId || '',
        sellerName: data.sellerName || '',
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        views: 0,
        favorites: [],
        contactOptions: data.contactOptions || { call: true, whatsapp: true, chat: true },
        negotiable: data.negotiable || false,
        specs: data.specs,
      };
      stored.push(newDraft);
    }

    saveStoredListings(stored);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save draft' };
  }
}

export async function updateListing(id: string, data: Partial<Listing>): Promise<{ success: boolean; error?: string }> {
  try {
    const stored = getStoredListings();
    const index = stored.findIndex(l => l.id === id);
    
    if (index < 0) {
      return { success: false, error: 'Listing not found' };
    }

    stored[index] = { ...stored[index], ...data, updatedAt: Date.now() };
    saveStoredListings(stored);

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update listing' };
  }
}

export async function getListing(id: string): Promise<Listing | null> {
  const allListings = getAllListings();
  return allListings.find(l => l.id === id || l.publicId === id) || null;
}

export async function listListings(filter?: { sellerId?: string; status?: string; category?: string }): Promise<Listing[]> {
  const all = getAllListings();
  
  return all.filter(l => {
    if (filter?.sellerId && l.sellerId !== filter.sellerId) return false;
    if (filter?.status && l.status !== filter.status) return false;
    if (filter?.category && l.category !== filter.category) return false;
    return true;
  });
}

export async function getMyListings(userId: string): Promise<Listing[]> {
  return listListings({ sellerId: userId });
}

export async function deleteListing(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stored = getStoredListings();
    const index = stored.findIndex(l => l.id === id);
    
    if (index < 0) {
      return { success: false, error: 'Listing not found' };
    }

    stored.splice(index, 1);
    saveStoredListings(stored);

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete listing' };
  }
}

export async function searchListings(query: string, filters?: any): Promise<Listing[]> {
  const all = getAllListings();
  const lowerQuery = query.toLowerCase();

  return all.filter(l => {
    const matchesQuery = !query || 
      l.title.toLowerCase().includes(lowerQuery) || 
      l.description.toLowerCase().includes(lowerQuery) ||
      l.publicId.includes(query);
    
    if (!matchesQuery) return false;
    if (filters?.category && l.category !== filters.category) return false;
    if (filters?.minPrice && l.price < filters.minPrice) return false;
    if (filters?.maxPrice && l.price > filters.maxPrice) return false;
    
    return true;
  });
}
