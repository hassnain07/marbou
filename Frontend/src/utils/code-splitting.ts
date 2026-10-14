import { lazy, LazyExoticComponent, ComponentType, ReactNode } from 'react';

/**
 * Type for a page component that can be lazily loaded.
 * A page component is a React component that accepts any props.
 */
type PageComponent<T extends Record<string, unknown> = Record<string, never>> = ComponentType<T>;

/**
 * Wraps a dynamic import for a page component with React.lazy for code splitting.
 * Enables automatic bundle splitting and lazy loading of page routes.
 *
 * @template T - The props type of the page component
 * @param importFunc - A function that returns a dynamic import promise (e.g., () => import('./MyPage'))
 * @returns A lazy-loaded React component
 *
 * @example
 * const HomePage = lazyPage(() => import('../pages/HomePage'));
 * const SearchPage = lazyPage(() => import('../pages/SearchPage'));
 */
export function lazyPage<T extends Record<string, unknown> = Record<string, never>>(
  importFunc: () => Promise<{ default: PageComponent<T> }>
): LazyExoticComponent<PageComponent<T>> {
  return lazy(importFunc);
}

export type { PageComponent };
