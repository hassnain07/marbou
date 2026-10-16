import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { GatedActionType } from '../context/AppContext';

/**
 * Hook to gate user actions (favorite, message, chat, etc.)
 * Shows auth modal if user is not signed in
 */
export function useGate() {
  const { user } = useAuth();
  const { showAuthGate } = useApp();

  const requireAuth = (action: GatedActionType, callback?: () => void) => {
    if (!user) {
      showAuthGate(action);
      return false;
    }
    if (callback) callback();
    return true;
  };

  return { requireAuth, isAuthenticated: !!user };
}
