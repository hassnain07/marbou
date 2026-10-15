import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/Router';
import { X, Mail, Chrome, Facebook, Apple } from 'lucide-react';

interface AuthGateSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  action?: 'message' | 'offer' | 'chat' | 'favorite' | null;
}

export function AuthGateSheet({
  open,
  onClose,
  onSuccess,
  action = null,
}: AuthGateSheetProps) {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();

  if (!open) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSocialClick = (provider: string) => {
    // Mock social auth response
    navigate(`/login?provider=${provider}`);
    onClose();
  };

  const actionLabel = action ? `${action[0].toUpperCase()}${action.slice(1)}` : 'Action';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-950/40 z-[99]"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] animate-slide-up">
        <div className="bg-white rounded-t-2xl shadow-2xl pt-6 pb-8 px-4 sm:px-6 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-800">
              {t('signInToContinue')}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-sand-100 text-primary-400"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Description */}
          {action && (
            <p className="text-sm text-primary-600 mb-4">
              {action === 'message' && t('toUseFeature')}
              {action === 'offer' && 'To send an offer'}
              {action === 'chat' && 'To start chatting'}
              {action === 'favorite' && 'To add to favorites'}
            </p>
          )}

          {/* Social Buttons */}
          <div className="space-y-2.5 mb-4">
            <button
              onClick={() => handleSocialClick('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-sand-200 rounded-xl hover:bg-sand-50 transition-all"
            >
              <Chrome className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-primary-700">{t('continueGoogle')}</span>
            </button>
            <button
              onClick={() => handleSocialClick('facebook')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-sand-200 rounded-xl hover:bg-sand-50 transition-all"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-primary-700">{t('continueFacebook')}</span>
            </button>
            <button
              onClick={() => handleSocialClick('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-sand-200 rounded-xl hover:bg-sand-50 transition-all"
            >
              <Apple className="w-5 h-5 text-primary-800" />
              <span className="font-medium text-primary-700">{t('continueApple')}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sand-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-primary-400">{t('or')}</span>
            </div>
          </div>

          {/* Email Button */}
          <button
            onClick={() => handleNavigate('/login')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all mb-3"
          >
            <Mail className="w-5 h-5" />
            {t('continueEmail')}
          </button>

          {/* Register Link */}
          <div className="text-center pt-3 border-t border-sand-100">
            <p className="text-sm text-primary-500 mb-2">{t('dontHaveAccount')}</p>
            <button
              onClick={() => handleNavigate('/register')}
              className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors"
            >
              {t('createAccount')}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              {t('secureTransaction')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
