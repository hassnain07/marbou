// FEAT-001: Complete Authentication Flow (AUTH-01 through AUTH-07)
// Screens: Sign-in hub, Register, Login, OTP verification, Password reset (request + new password), Add email

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useAuth, AccountType } from '@/context/AuthContext';
import { useRouter, Link } from '@/router/Router';
import { categories } from '@/data/mockData';
import {
  User, Store, Mail, Lock, Phone, UserCircle, Building2,
  ChevronLeft, ChevronRight, Check, AlertCircle, Eye, EyeOff, ArrowRight,
  Chrome, MessageCircle, Apple,
} from 'lucide-react';
import type { TranslationKey } from '@/i18n/translations';

const ACCOUNT_TYPES: {
  id: AccountType;
  icon: typeof User;
  key: TranslationKey;
  descKey: TranslationKey;
}[] = [
  { id: 'buyer_seller', icon: User, key: 'buyerSeller', descKey: 'buyerSellerDesc' },
  { id: 'business', icon: Store, key: 'business', descKey: 'businessDesc' },
];

// AUTH-01: Sign-In Hub - Social + Email entry point
export function SignInHubPage() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();

  const handleSocialClick = (provider: 'google' | 'facebook' | 'apple') => {
    // Mock social login - just navigate to login with indicator
    navigate(`/login?provider=${provider}`);
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-primary-800 mb-2 text-center">{t('signInToStart')}</h1>
          <p className="text-sm text-primary-400 text-center mb-6">{t('signInSubtitle')}</p>

          <div className="space-y-3">
            {/* Social buttons */}
            <button
              onClick={() => handleSocialClick('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-sand-100 hover:border-primary-200 transition-all hover:bg-sand-50"
            >
              <Chrome className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">{t('signInWithGoogle')}</span>
            </button>

            <button
              onClick={() => handleSocialClick('facebook')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-sand-100 hover:border-primary-200 transition-all hover:bg-sand-50"
            >
              <MessageCircle className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">{t('signInWithFacebook')}</span>
            </button>

            <button
              onClick={() => handleSocialClick('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-sand-100 hover:border-primary-200 transition-all hover:bg-sand-50"
            >
              <Apple className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">{t('signInWithApple')}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-sand-200" />
            <span className="text-xs text-primary-300 px-2">{t('or')}</span>
            <div className="flex-1 h-px bg-sand-200" />
          </div>

          {/* Email option */}
          <Link to="/login" className="w-full block">
            <button className="btn-primary w-full justify-center">
              <Mail className="w-4 h-4" />
              {t('signInWithEmail')}
            </button>
          </Link>

          {/* Register link */}
          <p className="text-center text-sm text-primary-400 mt-6">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
              {t('createAccount')}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-primary-300 mt-4">{t('tagline')}</p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { t, lang, dir } = useI18n();
  const { register } = useAuth();
  const { navigate } = useRouter();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const Arrow = lang === 'ar' ? ChevronLeft : ChevronRight;
  const ArrowBack = lang === 'ar' ? ChevronRight : ChevronLeft;

  const handleSubmit = async () => {
    setError('');
    if (!accountType || !email || !password || !displayName) {
      setError(t('fillAllFields'));
      return;
    }
    if (accountType === 'business' && !businessName) {
      setError(t('fillAllFields'));
      return;
    }
    setLoading(true);
    const result = await register({
      email,
      password,
      accountType,
      displayName,
      phone,
      businessName: accountType === 'business' ? businessName : undefined,
      businessCategory: accountType === 'business' ? businessCategory : undefined,
    });

    setLoading(false);
    if (result.success) {
      navigate(accountType === 'business' ? '/business' : '/account');
    } else {
      setError(result.error === 'emailExists' ? t('emailExists') : t('errorState'));
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-primary-800 mb-1">{t('createAccount')}</h1>
          <p className="text-sm text-primary-400 mb-6">{t('registerSubtitle')}</p>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[0, 1].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-primary-600' : s < step ? 'w-8 bg-primary-300' : 'w-2 bg-sand-200'}`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Step 0: Account type selection */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-primary-700">{t('selectAccountType')}</h2>
              <div className="space-y-3">
                {ACCOUNT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const selected = accountType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setAccountType(type.id)}
                      className={`w-full p-4 rounded-xl border-2 text-start transition-all flex items-center gap-4 ${
                        selected
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                          : 'border-sand-100 hover:border-primary-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-primary-600 text-white' : 'bg-sand-100 text-primary-400'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary-700 text-sm">{t(type.key)}</p>
                        <p className="text-xs text-primary-400 mt-0.5">{t(type.descKey)}</p>
                      </div>
                      {selected && <Check className="w-5 h-5 text-primary-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!accountType}
                className="btn-primary w-full"
              >
                {t('next')}<Arrow className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              {accountType === 'business' && (
                <div className="p-3 bg-primary-50 rounded-xl flex items-center gap-2 text-sm text-primary-600">
                  <Building2 className="w-4 h-4 shrink-0" />
                  {t('businessRegistrationNote')}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('emailLabel')}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input ps-10"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('passwordLabel')}</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input ps-10 pe-10"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-primary-300 hover:text-primary-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('displayNameLabel')}</label>
                <div className="relative">
                  <UserCircle className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input ps-10"
                    placeholder={lang === 'ar' ? 'اسمك' : 'Your name'}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('phoneLabel')}</label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input ps-10"
                    placeholder="+249..."
                    dir="ltr"
                  />
                </div>
              </div>

              {accountType === 'business' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('businessNameLabel')}</label>
                    <div className="relative">
                      <Store className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="input ps-10"
                        placeholder={lang === 'ar' ? 'اسم النشاط التجاري' : 'Business name'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('businessCategoryLabel')}</label>
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="input"
                    >
                      <option value="">--</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{t(cat.key)}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">
                  <ArrowBack className="w-4 h-4" />{t('back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email || !password || !displayName}
                  className="btn-primary flex-[2]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Check className="w-4 h-4" />{t('createAccount')}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Login link */}
          <p className="text-center text-sm text-primary-400 mt-6">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
              {t('login')}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-primary-300 mt-4">{t('tagline')}</p>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { t, lang } = useI18n();
  const { login, user } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect after successful login
  useEffect(() => {
    if (user) {
      navigate(user.accountType === 'business' ? '/business' : '/account');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError(t('fillAllFields'));
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error === 'invalidCredentials' ? t('invalidCredentials') : t('errorState'));
    }
    // Navigation happens via useEffect when user is set
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-primary-800 mb-1">{t('login')}</h1>
          <p className="text-sm text-primary-400 mb-6">{t('loginSubtitle')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="input ps-10"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-primary-600">{t('passwordLabel')}</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="input ps-10 pe-10"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-primary-300 hover:text-primary-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-sand-200 cursor-pointer"
              />
              <span className="text-sm text-primary-600">{t('rememberMe')}</span>
            </label>

            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('login')
              )}
            </button>
          </div>

          <p className="text-center text-sm text-primary-400 mt-6">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
              {t('createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// AUTH-04: OTP Verification - 6 digit inputs with auto-advance
export function OTPPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError(t('invalidOTP'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/account'); // Mock: success
    }, 400);
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-primary-800 mb-1">{t('verifyOTP')}</h1>
          <p className="text-sm text-primary-400 mb-6">{t('enterOTPSent')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-6">
            {/* OTP digit inputs */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-bold rounded-xl border-2 border-sand-200 focus:border-primary-500 focus:outline-none"
                />
              ))}
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.some(d => !d)}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{t('verify')}</>
              )}
            </button>

            {/* Resend */}
            <div className="text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t('resendOTP')}
                </button>
              ) : (
                <span className="text-sm text-primary-400">
                  {t('resendIn')} {countdown}s
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// AUTH-05: Password Reset Request
export function ForgotPasswordPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();

  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Request OTP with email
  const handleRequestOTP = () => {
    setError('');
    if (!email) {
      setError(t('fillAllFields'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setCountdown(60);
      setCanResend(false);
    }, 400);
  };

  // Step 2: Verify OTP
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError(t('invalidOTP'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('reset');
      setOtp(['', '', '', '', '', '']);
    }, 400);
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
  };

  // Step 3: Reset password
  const handleResetPassword = () => {
    setError('');
    if (!newPassword || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to login with success
      navigate('/login');
    }, 400);
  };

  // Step 1: Enter email
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
                <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
          </div>

          <div className="card p-6 sm:p-8">
            <h1 className="text-xl font-bold text-primary-800 mb-1">{t('resetPassword')}</h1>
            <p className="text-sm text-primary-400 mb-6">{t('enterEmailForReset')}</p>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('emailLabel')}</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRequestOTP()}
                    className="input ps-10"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                onClick={handleRequestOTP}
                disabled={loading || !email}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('sendOTP')
                )}
              </button>

              <Link to="/login" className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                {t('backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Verify OTP
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-7 h-7">
                <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
                <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
          </div>

          <div className="card p-6 sm:p-8">
            <h1 className="text-xl font-bold text-primary-800 mb-1">{t('verifyOTP')}</h1>
            <p className="text-sm text-primary-400 mb-6">{t('enterOTPSent')} <strong>{email}</strong></p>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="space-y-6">
              {/* OTP digit inputs */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg font-bold rounded-xl border-2 border-sand-200 focus:border-primary-500 focus:outline-none"
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.some(d => !d)}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  t('verify')
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t('resendOTP')}
                  </button>
                ) : (
                  <span className="text-sm text-primary-400">
                    {t('resendIn')} {countdown}s
                  </span>
                )}
              </div>

              <button
                onClick={() => setStep('email')}
                className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium w-full"
              >
                {t('changeEmail')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Reset password
  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-primary-800 mb-1">{t('newPassword')}</h1>
          <p className="text-sm text-primary-400 mb-6">{t('enterNewPasswordDesc')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('passwordLabel')}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input ps-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('confirmPasswordLabel')}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                  className="input ps-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('resetPassword')
              )}
            </button>

            <Link to="/login" className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// AUTH-06: Set New Password
export function ResetPasswordPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!password || !confirmPassword) {
      setError(t('fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordsMustMatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-primary-800 mb-1">{t('newPassword')}</h1>
          <p className="text-sm text-primary-400 mb-6">{t('enterNewPassword')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('passwordLabel')}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input ps-10 pe-10"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-primary-300 hover:text-primary-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('confirmPasswordLabel')}</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="input ps-10 pe-10"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-primary-300 hover:text-primary-500"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !password || !confirmPassword}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('resetPassword')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// AUTH-07: Add Email (for social sign-up users)
export function AddEmailPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setError('');
    if (!email) {
      setError(t('fillAllFields'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/account');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <path d="M28 70 L28 30 L50 30 L50 70" stroke="#fdfbf7" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="72" cy="50" r="14" stroke="#f97e16" strokeWidth="6" fill="none" />
              <circle cx="72" cy="50" r="4" fill="#fdfbf7" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-primary-700">{t('brandName')}</span>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-primary-800 mb-1">{t('addEmail')}</h1>
          <p className="text-sm text-primary-400 mb-6">{t('addEmailForAccount')}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-50 rounded-xl text-error-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-600 mb-1.5 block">{t('emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="input ps-10"
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('continue')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
