import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/router/Router';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredAccountType?: 'buyer_seller' | 'business' | 'admin';
}

export function ProtectedRoute({ children, requiredAccountType }: ProtectedRouteProps) {
  const { user } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }

    // If a specific account type is required, check it
    if (requiredAccountType && user.accountType !== requiredAccountType) {
      navigate('/', { replace: true });
    }
  }, [user, requiredAccountType, navigate]);

  if (!user) return null;

  // Check account type if required
  if (requiredAccountType && user.accountType !== requiredAccountType) {
    return null;
  }

  return <>{children}</>;
}
