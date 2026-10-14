/**
 * Image preset definitions for responsive image optimization.
 * Each preset specifies width (w), height (h), and quality (q) parameters.
 */
export interface ImagePreset {
  w: number;
  h: number;
  q: number;
}

/**
 * Predefined image presets for common use cases in the marketplace.
 * These presets are optimized for different contexts (thumbnail, card detail, detail view, hero banner).
 */
export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  /**
   * Thumbnail preset: small square images for listings in grid views.
   * 150x150px at 70% quality for fast loading.
   */
  thumbnail: {
    w: 150,
    h: 150,
    q: 70,
  },

  /**
   * Card preset: medium images for listing cards in search results and home page.
   * 300x300px at 80% quality for balance between quality and size.
   */
  card: {
    w: 300,
    h: 300,
    q: 80,
  },

  /**
   * Detail preset: larger images for listing detail pages.
   * 600x600px at 85% quality for better visual clarity.
   */
  detail: {
    w: 600,
    h: 600,
    q: 85,
  },

  /**
   * Hero preset: full-width banner images for home page and featured sections.
   * 1200x400px at 90% quality for premium visual impact.
   */
  hero: {
    w: 1200,
    h: 400,
    q: 90,
  },
};

/**
 * Generates a responsive image URL with CDN transformation parameters.
 * Assumes CDN supports standard image transformation syntax (e.g., Cloudinary, imgix, or similar).
 *
 * @param baseUrl - The original image URL
 * @param preset - The image preset key (e.g., 'thumbnail', 'card', 'detail', 'hero')
 * @returns The transformed image URL with optimization parameters
 *
 * @example
 * const thumbUrl = getResponsiveImage('https://cdn.example.com/image.jpg', 'thumbnail');
 * // Returns: https://cdn.example.com/image.jpg?w=150&h=150&q=70
 */
export function getResponsiveImage(baseUrl: string, preset: keyof typeof IMAGE_PRESETS): string {
  const imagePreset = IMAGE_PRESETS[preset];
  if (!imagePreset) {
    throw new Error(`Unknown image preset: ${preset}`);
  }

  const url = new URL(baseUrl);
  url.searchParams.set('w', imagePreset.w.toString());
  url.searchParams.set('h', imagePreset.h.toString());
  url.searchParams.set('q', imagePreset.q.toString());

  return url.toString();
}

/**
 * Generates a srcset string for responsive image loading across different device pixel ratios.
 * Creates URLs for 1x and 2x pixel densities to support both standard and retina displays.
 *
 * @param baseUrl - The original image URL
 * @param preset - The image preset key (e.g., 'thumbnail', 'card', 'detail', 'hero')
 * @returns A srcset string suitable for the img srcset attribute
 *
 * @example
 * const srcset = getSrcSet('https://cdn.example.com/image.jpg', 'card');
 * // Returns: "https://cdn.example.com/image.jpg?w=300&h=300&q=80 1x, https://cdn.example.com/image.jpg?w=600&h=600&q=80 2x"
 */
export function getSrcSet(baseUrl: string, preset: keyof typeof IMAGE_PRESETS): string {
  const imagePreset = IMAGE_PRESETS[preset];
  if (!imagePreset) {
    throw new Error(`Unknown image preset: ${preset}`);
  }

  const url1x = new URL(baseUrl);
  url1x.searchParams.set('w', imagePreset.w.toString());
  url1x.searchParams.set('h', imagePreset.h.toString());
  url1x.searchParams.set('q', imagePreset.q.toString());

  const url2x = new URL(baseUrl);
  url2x.searchParams.set('w', (imagePreset.w * 2).toString());
  url2x.searchParams.set('h', (imagePreset.h * 2).toString());
  url2x.searchParams.set('q', imagePreset.q.toString());

  return `${url1x.toString()} 1x, ${url2x.toString()} 2x`;
}
