'use client'

import { useState, useEffect } from 'react'
import {
  Check,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  X,
  Layers,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  price: number
  billingPeriod: string
  features: string[]
}

interface Subscription {
  id: string
  status: string
  startDate: string
  endDate: string
  plan: Plan
}

interface PlanCardData {
  key: 'FREE' | 'STARTUP' | 'PREMIUM'
  titleAr: string
  titleEn: string
  subtitleAr: string
  subtitleEn: string
  monthlyPrice: number
  annualPrice: number
  isPopular?: boolean
  featuresAr: string[]
  featuresEn: string[]
}

const STATIC_PLANS: PlanCardData[] = [
  {
    key: 'FREE',
    titleAr: 'مجاني',
    titleEn: 'Free',
    subtitleAr: 'لاكتشاف المنصة ومحتوياتها',
    subtitleEn: 'Discover the platform and explore features',
    monthlyPrice: 0,
    annualPrice: 0,
    featuresAr: [
      'الوصول إلى الخدمات',
      'تصفح البرامج التدريبية',
      'الدعم عبر البريد الإلكتروني',
      'متابعة الطلبات الأساسية',
    ],
    featuresEn: [
      'Access to services catalog',
      'Browse training programs',
      'Email support',
      'Basic request tracking',
    ],
  },
  {
    key: 'STARTUP',
    titleAr: 'ستارتب',
    titleEn: 'Startup',
    subtitleAr: 'لرواد الأعمال والشركات النامية',
    subtitleEn: 'For entrepreneurs and growing startups',
    monthlyPrice: 2000,
    annualPrice: 19200,
    isPopular: true,
    featuresAr: [
      'الوصول لجميع الخدمات',
      'الحجوزات مشمولة',
      'خصومات حصرية على البرامج',
      'متابعة الطلبات الكاملة',
      'دعم ذو أولوية',
    ],
    featuresEn: [
      'Full access to all services',
      'Session bookings included',
      'Exclusive program discounts',
      'Complete request tracking',
      'Priority customer support',
    ],
  },
  {
    key: 'PREMIUM',
    titleAr: 'بريميوم',
    titleEn: 'Premium',
    subtitleAr: 'لأقصى أداء ممكن ومرافقة شاملة',
    subtitleEn: 'For peak performance and comprehensive coaching',
    monthlyPrice: 5000,
    annualPrice: 48000,
    featuresAr: [
      'جميع مزايا ستارتب',
      'تدريب شخصي مخصص 1-على-1',
      'الوصول لخبراء معتمدين',
      'أولوية كاملة في الحجوزات',
      'تقرير أداء شهري مخصص',
    ],
    featuresEn: [
      'All Startup plan benefits',
      '1-on-1 personalized mentoring',
      'Direct access to senior experts',
      'Unlimited priority booking',
      'Monthly dedicated growth report',
    ],
  },
]

export default function SubscriptionPage() {
  const { language } = useLanguage()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // Checkout modal state
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<{
    dbPlanId: string
    planData: PlanCardData
    price: number
  } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'EDAHABIA' | 'CIB' | 'VIREMENT'>('EDAHABIA')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/subscriptions')
      const data = await res.json()
      if (data.success) {
        setPlans(data.data.plans)
        setCurrentSub(data.data.currentSubscription)
      }
    } catch {
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleOpenCheckout = (card: PlanCardData) => {
    // Find matching DB plan
    const dbPlan = plans.find((p) => p.name.toUpperCase() === card.key)
    const dbPlanId = dbPlan ? dbPlan.id : ''

    const isCurrent = currentSub?.plan.name.toUpperCase() === card.key
    if (isCurrent) {
      toast.info(language === 'ar' ? 'أنت مشترك بالفعل في هذه الخطة.' : 'You are already on this plan.')
      return
    }

    const price = billingCycle === 'yearly' ? card.annualPrice : card.monthlyPrice

    // If free plan, process immediately without checkout modal
    if (price === 0) {
      processSubscription(dbPlanId, card.key, 0)
      return
    }

    setSelectedPlanToBuy({
      dbPlanId,
      planData: card,
      price,
    })
  }

  const processSubscription = async (planId: string, planKey: string, price: number) => {
    setIsProcessing(true)
    try {
      // 1. Process payment if price > 0
      if (price > 0) {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: price,
            paymentType: 'SUBSCRIPTION',
            referenceId: planKey,
          }),
        })
      }

      // 2. Activate subscription
      const subRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId || plans.find((p) => p.name.toUpperCase() === planKey)?.id,
          billingCycle,
        }),
      })

      const subData = await subRes.json()
      if (subData.success) {
        const planTitle = language === 'ar'
          ? (planKey === 'FREE' ? 'المجانية' : planKey === 'STARTUP' ? 'ستارتب' : 'بريميوم')
          : planKey

        toast.success(
          language === 'ar'
            ? `تم الاشتراك في خطة ${planTitle} (${billingCycle === 'yearly' ? 'السنوية' : 'الشهرية'}) بنجاح!`
            : `Successfully subscribed to ${planTitle} (${billingCycle}) plan!`
        )
        setSelectedPlanToBuy(null)
        await fetchSubscriptions()
      } else {
        toast.error(subData.error || 'Failed to update subscription')
      }
    } catch {
      toast.error('Failed to process subscription')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlanToBuy) return
    await processSubscription(
      selectedPlanToBuy.dbPlanId,
      selectedPlanToBuy.planData.key,
      selectedPlanToBuy.price
    )
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  const currentPlanKey = currentSub?.plan.name.toUpperCase() || 'FREE'

  return (
    <div className="space-y-8 text-start">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {language === 'ar' ? 'إدارة خطة الاشتراك' : 'Subscription & Plans'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'قم بترقية خطتك للحصول على ميزات ومرافقة غير محدودة.'
              : 'Upgrade or manage your subscription to unlock premium features and dedicated coaching.'}
          </p>
        </div>

        {/* ── Monthly / Annual Toggle ── */}
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200 self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
              billingCycle === 'monthly'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-brand-slate hover:text-brand-navy'
            )}
          >
            {language === 'ar' ? 'الشهري' : 'Monthly'}
          </button>

          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer',
              billingCycle === 'yearly'
                ? 'bg-brand-blue text-white shadow-sm'
                : 'text-brand-slate hover:text-brand-navy'
            )}
          >
            <span>{language === 'ar' ? 'السنوي' : 'Annual'}</span>
            <span
              className={cn(
                'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full',
                billingCycle === 'yearly'
                  ? 'bg-brand-coral text-white'
                  : 'bg-brand-coral/15 text-brand-coral'
              )}
            >
              {language === 'ar' ? 'وفّر 20%' : 'Save 20%'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Current Active Plan Banner ── */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1D5B79] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute end-0 top-0 w-80 h-80 bg-brand-sky/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-brand-sky">
                {language === 'ar' ? 'الخطة الحالية' : 'Current Active Plan'}
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'ar' ? 'نشطة' : 'Active'}
              </span>
            </div>
            <h2 className="text-3xl font-black mt-3">
              {currentPlanKey === 'STARTUP'
                ? (language === 'ar' ? 'ستارتب' : 'Startup')
                : currentPlanKey === 'PREMIUM'
                ? (language === 'ar' ? 'بريميوم' : 'Premium')
                : (language === 'ar' ? 'مجاني' : 'Free')}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              {currentSub ? (
                <>
                  <span>{language === 'ar' ? 'تاريخ التجديد:' : 'Renews on:'} </span>
                  <span dir="ltr">{new Date(currentSub.endDate).toLocaleDateString()}</span>
                </>
              ) : language === 'ar' ? (
                'خطة مجانية استكشافية'
              ) : (
                'Free exploratory tier'
              )}
            </p>
          </div>

          <div className="text-start sm:text-end">
            <span className="text-xs text-gray-300 block">{language === 'ar' ? 'السعر' : 'Price'}</span>
            <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-extrabold text-brand-sky">
              <span dir="ltr" className="font-mono">
                {currentSub ? currentSub.plan.price.toLocaleString() : '0'}
              </span>
              <span className="text-sm">{language === 'ar' ? 'دج' : 'DA'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Three Pricing Plans Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-2">
        {STATIC_PLANS.map((plan) => {
          const isCurrent = currentPlanKey === plan.key
          const isPopular = !!plan.isPopular

          const displayPrice =
            billingCycle === 'yearly' ? plan.annualPrice : plan.monthlyPrice

          const periodLabel =
            billingCycle === 'yearly'
              ? language === 'ar'
                ? 'دج / سنة'
                : 'DA / year'
              : language === 'ar'
              ? 'دج / شهر'
              : 'DA / month'

          const monthlyEquivalent =
            billingCycle === 'yearly' && plan.key === 'STARTUP'
              ? 1600
              : billingCycle === 'yearly' && plan.key === 'PREMIUM'
              ? 4000
              : null

          const savings =
            billingCycle === 'yearly' && plan.key === 'STARTUP'
              ? language === 'ar'
                ? 'وفّر 4 800 دج'
                : 'Save 4,800 DA'
              : billingCycle === 'yearly' && plan.key === 'PREMIUM'
              ? language === 'ar'
                ? 'وفّر 12 000 دج'
                : 'Save 12,000 DA'
              : null

          const features = language === 'ar' ? plan.featuresAr : plan.featuresEn
          const planTitle = language === 'ar' ? plan.titleAr : plan.titleEn
          const planSubtitle = language === 'ar' ? plan.subtitleAr : plan.subtitleEn

          return (
            <div
              key={plan.key}
              className={cn(
                'bg-white rounded-3xl p-7 sm:p-8 border transition-all duration-300 flex flex-col justify-between relative text-start',
                isPopular
                  ? 'border-2 border-[#E2705B] shadow-md ring-4 ring-[#E2705B]/10'
                  : isCurrent
                  ? 'border-2 border-brand-blue shadow-md'
                  : 'border-gray-100 shadow-xs hover:shadow-md'
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center pointer-events-none">
                  <span className="bg-[#E2705B] text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</span>
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && !isPopular && (
                <div className="absolute -top-3.5 start-6">
                  <span className="bg-brand-blue text-white text-[10px] font-bold uppercase px-3 py-0.5 rounded-full shadow-xs">
                    {language === 'ar' ? 'خطتك الحالية' : 'Current Plan'}
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-brand-navy">{planTitle}</h3>
                  <p className="text-xs text-brand-slate mt-1 min-h-[32px] leading-relaxed">
                    {planSubtitle}
                  </p>
                </div>

                {/* Price Block */}
                <div className="my-6 pb-6 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span dir="ltr" className="text-4xl sm:text-5xl font-black text-brand-navy font-mono">
                      {displayPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-brand-slate">
                      {periodLabel}
                    </span>
                  </div>

                  {/* Savings / Equivalent breakdown for yearly billing */}
                  {monthlyEquivalent && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-brand-slate font-medium">
                        (~<span dir="ltr">{monthlyEquivalent.toLocaleString()}</span> {language === 'ar' ? 'دج / شهر' : 'DA / month'})
                      </span>
                      {savings && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {savings}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 mb-8">
                  {features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-brand-navy">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border',
                          isPopular
                            ? 'bg-[#E2705B]/15 text-[#E2705B] border-[#E2705B]/30'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        )}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="font-medium leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenCheckout(plan)}
                disabled={isCurrent || isProcessing}
                className={cn(
                  'w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs',
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : isPopular
                    ? 'bg-[#E2705B] hover:bg-[#d45f4a] text-white shadow-sm'
                    : 'bg-brand-navy hover:bg-brand-navy/90 text-white'
                )}
              >
                {isCurrent ? (
                  <span>{language === 'ar' ? 'الخطة الحالية' : 'Active Plan'}</span>
                ) : (
                  <>
                    <span>
                      {language === 'ar'
                        ? `الاشتراك في ${planTitle} (${billingCycle === 'yearly' ? 'سنوي' : 'شهري'})`
                        : `Subscribe to ${planTitle} (${billingCycle})`}
                    </span>
                    <ArrowRight className={cn('w-3.5 h-3.5', language === 'ar' && 'rotate-180')} />
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Checkout Modal ── */}
      {selectedPlanToBuy && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-start">
            <button
              onClick={() => setSelectedPlanToBuy(null)}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'تأكيد الاشتراك والدفع' : 'Confirm Subscription & Payment'}
            </h3>
            <p className="text-xs text-brand-slate mb-6">
              {language === 'ar'
                ? `خطة: ${language === 'ar' ? selectedPlanToBuy.planData.titleAr : selectedPlanToBuy.planData.titleEn} (${billingCycle === 'yearly' ? 'السنوية' : 'الشهرية'})`
                : `Plan: ${selectedPlanToBuy.planData.titleEn} (${billingCycle})`}
            </p>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'وسيلة الدفع الإلكتروني' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EDAHABIA', 'CIB', 'VIREMENT'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={cn(
                        'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                        paymentMethod === m
                          ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                          : 'border-gray-200 text-brand-slate hover:bg-gray-50'
                      )}
                    >
                      {m === 'EDAHABIA' ? 'الذهبية' : m === 'CIB' ? 'بطاقة CIB' : 'تحويل بنكي'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Details */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 text-xs text-brand-slate">
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'قيمة الاشتراك:' : 'Plan Price:'}</span>
                  <span className="font-bold text-brand-navy" dir="ltr">
                    {selectedPlanToBuy.price.toLocaleString()} DA
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{language === 'ar' ? 'مدة الاشتراك:' : 'Billing Period:'}</span>
                  <span>{billingCycle === 'yearly' ? (language === 'ar' ? '12 شهراً (سنوي)' : '12 Months (Annual)') : (language === 'ar' ? 'شهر واحد' : '1 Month')}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-brand-navy text-sm">
                  <span>{language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                  <span className="font-mono text-brand-blue" dir="ltr">
                    {selectedPlanToBuy.price.toLocaleString()} DA
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlanToBuy(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 btn-primary text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{language === 'ar' ? 'تأكيد ودفع' : 'Confirm & Pay'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
