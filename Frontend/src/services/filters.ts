import { listings } from '@/data/mockData';

/**
 * Extract distinct spec values for a given category
 * Used to populate dynamic filter options
 */
export function getSpecOptionsForCategory(categoryId: string): Record<string, string[]> {
  const categoryListings = listings.filter((l) => l.category === categoryId && l.status === 'published');
  
  if (categoryListings.length === 0) return {};

  const specMap: Record<string, Set<string>> = {};

  categoryListings.forEach((listing) => {
    listing.specs?.forEach((spec) => {
      if (!specMap[spec.key]) {
        specMap[spec.key] = new Set();
      }
      // Convert to string for consistency
      specMap[spec.key].add(String(spec.value));
    });
  });

  // Convert Sets to sorted arrays
  const result: Record<string, string[]> = {};
  Object.entries(specMap).forEach(([key, values]) => {
    result[key] = Array.from(values).sort();
  });

  return result;
}
