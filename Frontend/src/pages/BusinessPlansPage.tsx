import React, { useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { businesses } from '@/data/mockData';
import { useRouter } from '@/router/Router';
import { useI18n } from '@/i18n/I18nContext';
import { useApp } from '@/context/AppContext';

interface Plan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  monthlyPrice: number;
  yearlyPrice: number;
  listingQuota: number;
  features: {
    label: string;
    labelAr: string;
    included: boolean;
  }[];
  recommended?: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  price: number;
  listingsUsed: number;
  listingQuota: number;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    nameAr: 'أساسي',
    description: 'Perfect for getting started',
    descriptionAr: 'مثالي للبدء',
    monthlyPrice: 99,
    yearlyPrice: 990,
    listingQuota: 10,
    features: [
      { label: 'Up to 10 active listings', labelAr: 'حتى 10 إعلانات نشطة', included: true },
      { label: 'Basic analytics', labelAr: 'تحليلات أساسية', included: true },
      { label: 'Business profile', labelAr: 'ملف تعريفي للعمل', included: true },
      { label: 'Customer support', labelAr: 'دعم العملاء', included: true },
      { label: 'Featured listings', labelAr: 'إعلانات مميزة', included: false },
      { label: 'Priority support', labelAr: 'الدعم الأولوي', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    nameAr: 'احترافي',
    description: 'For growing businesses',
    descriptionAr: 'للشركات المتنامية',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    listingQuota: 50,
    recommended: true,
    features: [
      { label: 'Up to 50 active listings', labelAr: 'حتى 50 إعلان نشط', included: true },
      { label: 'Advanced analytics', labelAr: 'تحليلات متقدمة', included: true },
      { label: 'Business profile', labelAr: 'ملف تعريفي للعمل', included: true },
      { label: 'Priority customer support', labelAr: 'دعم العملاء الأولوي', included: true },
      { label: 'Featured listings (5/month)', labelAr: 'إعلانات مميزة (5/شهر)', included: true },
      { label: 'Priority support', labelAr: 'الدعم الأولوي', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameAr: 'مؤسسي',
    description: 'For large operations',
    descriptionAr: 'للعمليات الكبيرة',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    listingQuota: 500,
    features: [
      { label: 'Up to 500 active listings', labelAr: 'حتى 500 إعلان نشط', included: true },
      { label: 'Custom analytics & reports', labelAr: 'تحليلات وتقارير مخصصة', included: true },
      { label: 'Premium business profile', labelAr: 'ملف تعريفي علاقات عامة قسط', included: true },
      { label: '24/7 dedicated support', labelAr: 'دعم مخصص على مدار الساعة', included: true },
      { label: 'Unlimited featured listings', labelAr: 'إعلانات مميزة غير محدودة', included: true },
      { label: 'API access', labelAr: 'الوصول إلى API', included: true },
    ],
  },
];

export function BusinessPlansPage() {
  const { path } = useRouter();
  const { t, lang } = useI18n();
  const { featureFlags } = useApp();
  const pathParts = path.split('/').filter(Boolean);
  const bizId = pathParts.find(p => p.startsWith('biz-')) || 'biz-1';
  const business = businesses.find(b => b.id === bizId) || businesses[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const currentSubscription: Subscription | null = {
    id: 'sub-001',
    planId: 'professional',
    billingCycle: 'monthly',
    status: 'active',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-01-01'),
    renewalDate: new Date('2025-01-01'),
    price: 299,
    listingsUsed: 32,
    listingQuota: 50,
  };

  if (!featureFlags.ENABLE_MONETIZATION) {
    return (
      <div className="flex min-h-screen">
        <BusinessSidebar activeTab="plan" business={business} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-bold text-primary-700">{t('planSubs')}</span>
            <div className="w-9" />
          </div>

          <div className="p-4 sm:p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary-800 mb-2">
                {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
              </h2>
              <p className="text-primary-600 max-w-md">
                {lang === 'ar'
                  ? 'خطط الاشتراك والتسعير قيد التطوير. ستكون متاحة قريباً.'
                  : 'Subscription plans and pricing are coming soon. Stay tuned!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSelectPlan = (planId: string) => {
    console.log(`Selected plan: ${planId} for ${billingCycle} billing`);
  };

  const PlanCard = ({ plan }: { plan: Plan }) => {
    const isCurrentPlan = currentSubscription?.planId === plan.id;
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const savingsPercent = billingCycle === 'yearly' ? Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100) : 0;

    return (
      <div
        className={`relative rounded-lg border-2 transition-all ${
          plan.recommended
            ? 'border-primary-600 bg-primary-50 md:scale-105'
            : 'border-sand-100 bg-white hover:border-sand-200'
        }`}
      >
        {plan.recommended && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="px-4 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
              {lang === 'ar' ? 'موصى به' : 'Recommended'}
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Plan Header */}
          <h3 className="text-2xl font-bold text-primary-800 mb-2">{lang === 'ar' ? plan.nameAr : plan.name}</h3>
          <p className="text-sm text-primary-600 mb-4">{lang === 'ar' ? plan.descriptionAr : plan.description}</p>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-primary-800">{price}</span>
              <span className="text-primary-600">{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
              <span className="text-primary-600 text-sm">
                /{lang === 'ar' ? (billingCycle === 'monthly' ? 'شهري' : 'سنوي') : billingCycle === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {savingsPercent > 0 && (
              <p className="text-sm text-success-600 font-medium">
                {lang === 'ar' ? 'توفير' : 'Save'} {savingsPercent}% {lang === 'ar' ? 'مع الدفع السنوي' : 'with yearly billing'}
              </p>
            )}
          </div>

          {/* Action Button */}
          {isCurrentPlan ? (
            <button className="w-full py-3 bg-sand-100 text-primary-700 rounded-lg font-medium mb-6 cursor-default">
              {lang === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
            </button>
          ) : (
            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full py-3 rounded-lg font-medium mb-6 transition ${
                plan.recommended
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'border border-sand-200 text-primary-700 hover:bg-sand-50'
              }`}
            >
              {lang === 'ar' ? 'اختر هذه الخطة' : 'Choose Plan'}
            </button>
          )}

          {/* Listing Quota */}
          <div className="mb-6 p-4 bg-sand-50 rounded-lg">
            <p className="text-sm font-medium text-primary-800 mb-1">
              {lang === 'ar' ? 'حد الإعلانات' : 'Listing Quota'}
            </p>
            <p className="text-2xl font-bold text-primary-600">{plan.listingQuota}</p>
            <p className="text-xs text-primary-600 mt-1">
              {lang === 'ar' ? 'إعلانات نشطة في نفس الوقت' : 'active listings at a time'}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary-800 mb-3">
              {lang === 'ar' ? 'المميزات' : 'Features'}
            </p>
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {feature.included ? (
                  <Check className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-sand-300 flex-shrink-0 mt-0.5" />
                )}
                <span className={`text-sm ${feature.included ? 'text-primary-700' : 'text-primary-400'}`}>
                  {lang === 'ar' ? feature.labelAr : feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <BusinessSidebar activeTab="plan" business={business} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-primary-700">{t('planSubs')}</span>
          <div className="w-9" />
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">{t('planSubs')}</h1>
            <p className="text-sm text-primary-400">
              {lang === 'ar' ? 'اختر الخطة المناسبة لنموك' : 'Choose the perfect plan for your business'}
            </p>
          </div>

          {/* Current Subscription Info */}
          {currentSubscription && (
            <div className="mb-8 p-4 bg-primary-50 border border-primary-100 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-primary-800 mb-1">
                    {lang === 'ar' ? 'اشتراكك الحالي' : 'Your Current Subscription'}
                  </h3>
                  <p className="text-sm text-primary-700">
                    {lang === 'ar' ? 'خطة' : 'Plan'}: <span className="font-medium">{PLANS.find(p => p.id === currentSubscription.planId)?.name}</span>
                  </p>
                  <p className="text-sm text-primary-700">
                    {lang === 'ar' ? 'الإعلانات المستخدمة' : 'Listings used'}: {currentSubscription.listingsUsed} / {currentSubscription.listingQuota}
                  </p>
                  <p className="text-sm text-primary-700">
                    {lang === 'ar' ? 'التجديد' : 'Renews'}: {currentSubscription.renewalDate?.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
                <button className="px-4 py-2 bg-error-100 hover:bg-error-200 text-error-700 text-sm rounded font-medium transition">
                  {lang === 'ar' ? 'إلغاء الاشتراك' : 'Cancel'}
                </button>
              </div>

              {/* Usage Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-primary-700 mb-1">
                  <span>{lang === 'ar' ? 'استخدام الإعلانات' : 'Listing Usage'}</span>
                  <span>
                    {Math.round((currentSubscription.listingsUsed / currentSubscription.listingQuota) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-primary-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all"
                    style={{
                      width: `${(currentSubscription.listingsUsed / currentSubscription.listingQuota) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex bg-sand-100 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-primary-800 shadow'
                    : 'text-primary-700 hover:text-primary-800'
                }`}
              >
                {lang === 'ar' ? 'شهري' : 'Monthly'}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded font-medium transition ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-primary-800 shadow'
                    : 'text-primary-700 hover:text-primary-800'
                }`}
              >
                {lang === 'ar' ? 'سنوي' : 'Yearly'}
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {PLANS.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-primary-800 mb-6">
              {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-primary-800 mb-2">
                  {lang === 'ar' ? 'هل يمكنني تغيير خطتي في أي وقت؟' : 'Can I change my plan anytime?'}
                </h3>
                <p className="text-primary-700 text-sm">
                  {lang === 'ar'
                    ? 'نعم، يمكنك ترقية أو خفض خطتك في أي وقت. سيتم احتساب التغييرات على فاتورتك التالية.'
                    : 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next invoice.'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-primary-800 mb-2">
                  {lang === 'ar' ? 'هل يوجد عقد طويل الأجل؟' : 'Are there long-term contracts?'}
                </h3>
                <p className="text-primary-700 text-sm">
                  {lang === 'ar'
                    ? 'لا، جميع الخطط شهرية أو سنوية ويمكنك الإلغاء في نهاية كل فترة.'
                    : 'No, all plans are month-to-month or year-to-year and can be cancelled at any time.'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-primary-800 mb-2">
                  {lang === 'ar' ? 'ماذا يحدث إذا تجاوزت حد الإعلانات؟' : 'What if I exceed my listing quota?'}
                </h3>
                <p className="text-primary-700 text-sm">
                  {lang === 'ar'
                    ? 'لا يمكنك نشر إعلانات جديدة حتى تقوم بحذف أو تحديث إعلانات قديمة. يمكنك ترقية خطتك للحصول على حد أعلى.'
                    : 'You won\'t be able to post new listings until you delete or update old ones. You can upgrade your plan for a higher quota.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
