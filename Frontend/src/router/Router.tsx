import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface RouterState {
  path: string;
  params: Record<string, string>;
  navigate: (path: string) => void;
  back: () => void;
}

const RouterContext = createContext<RouterState | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handler = () => setPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((p: string) => {
    window.location.hash = p;
    window.scrollTo(0, 0);
  }, []);

  const back = useCallback(() => window.history.back(), []);

  const params: Record<string, string> = {};
  const parts = path.split('/').filter(Boolean);
  if (parts.length >= 2) {
    params.id = parts[parts.length - 1];
  }

  return (
    <RouterContext.Provider value={{ path, params, navigate, back }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function Link({ to, children, className, onClick }: { to: string; children: ReactNode; className?: string; onClick?: () => void }) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
