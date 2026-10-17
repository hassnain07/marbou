import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { GatedActionType } from '../context/AppContext';
import { useRouter } from '../router/Router';

/**
 * Hook to gate user actions (favorite, message, chat, etc.)
 * Shows auth modal if user is not signed in
 * Redirects to OTP verification for unverified users on certain actions
 */
export function useGate() {
  const { user } = useAuth();
  const { showAuthGate } = useApp();
  const { navigate } = useRouter();

  // Actions that require verified email
  const requiresVerification = ['message', 'offer', 'chat', 'apply', 'postWanted', 'review', 'report'];

  const requireAuth = (action: GatedActionType, callback?: () => void) => {
    if (!user) {
      showAuthGate(action);
      return false;
    }
    
    // Check if this action requires verified email and user is unverified
    if (requiresVerification.includes(action || '') && !user.emailVerified) {
      navigate('/auth/otp');
      return false;
    }
    
    if (callback) callback();
    return true;
  };

  return { requireAuth, isAuthenticated: !!user, isVerified: user?.emailVerified ?? false };
}
