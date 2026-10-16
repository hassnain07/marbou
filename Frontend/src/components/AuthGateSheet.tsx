import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/router/Router';
import { X, Lock } from 'lucide-react';

/**
 * Modal sheet that appears when user tries a gated action without auth
 * Shows a message about why they need to sign in, then redirects
 */
export function AuthGateSheet() {
  const { t } = useI18n();
  const { gatedAction, hideAuthGate } = useApp();
  const { navigate } = useRouter();

  const actionMessages: Record<string, { title: string; desc: string }> = {
    favorite: {
      title: 'Sign in to save items',
      desc: 'Create an account to save your favorite listings and access them anytime.',
    },
    message: {
      title: 'Sign in to contact seller',
      desc: 'Sign in to send messages and communicate directly with sellers.',
    },
    chat: {
      title: 'Sign in to chat',
      desc: 'You need to be signed in to join conversations.',
    },
    offer: {
      title: 'Sign in to make an offer',
      desc: 'Create an account to make offers on listings.',
    },
  };

  if (!gatedAction) return null;

  const message = actionMessages[gatedAction] || actionMessages.favorite;

  const handleSignIn = () => {
    hideAuthGate();
    navigate('/auth/login');
  };

  const handleSignUp = () => {
    hideAuthGate();
    navigate('/auth/register');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={hideAuthGate}
      />
      
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-2xl mx-auto bg-white rounded-t-3xl shadow-2xl animate-slide-up">
        <div className="p-6 sm:p-8">
          {/* Close button */}
          <button
            onClick={hideAuthGate}
            className="absolute top-4 end-4 p-2 text-primary-400 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-4 mx-auto">
            <Lock className="w-6 h-6 text-primary-600" />
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-primary-900 text-center mb-3">
            {message.title}
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-primary-600 text-center mb-6">
            {message.desc}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSignIn}
              className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-center"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="flex-1 px-6 py-3 bg-primary-50 text-primary-600 font-semibold rounded-lg hover:bg-primary-100 transition-colors text-center"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
