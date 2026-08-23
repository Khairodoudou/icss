'use client'

import { useState, useEffect } from 'react'
import { Check, Sparkles, Loader2, ArrowRight, Layers } from 'lucide-react'
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

export default function SubscriptionPage() {
  const { language } = useLanguage()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

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

  const handleSelectPlan = async (plan: Plan) => {
    if (currentSub?.plan.id === plan.id) {
      toast.info(language === 'ar' ? 'أنت مشترك بالفعل في هذه الخطة.' : 'You are already subscribed to this plan.')
      return
    }

    setUpgradingPlanId(plan.id)
    try {
      const planPrice =
        billingCycle === 'yearly'
          ? plan.name === 'STARTUP'
            ? 19200
            : plan.name === 'PREMIUM'
            ? 48000
            : 0
          : plan.price

      // 1. Process payment if price > 0
      if (planPrice > 0) {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: planPrice,
            paymentType: 'SUBSCRIPTION',
            referenceId: plan.id,
          }),
        })
      }

      // 2. Activate subscription
      const subRes = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
        }),
      })

      const subData = await subRes.json()
      if (subData.success) {
        toast.success(
          language === 'ar'
            ? `تم الاشتراك في خطة ${plan.name} (${billingCycle === 'yearly' ? 'السنوية' : 'الشهرية'}) بنجاح!`
            : `Successfully subscribed to ${plan.name} (${billingCycle}) plan!`
        )
        await fetchSubscriptions()
      }
    } catch {
      toast.error('Failed to process subscription')
    } finally {
      setUpgradingPlanId(null)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-8 text-start">
      {/* Header */}
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

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center gap-2 p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200 self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer',
              billingCycle === 'monthly'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-brand-slate hover:text-brand-navy'
            )}
          >
            {language === 'ar' ? 'شهري' : 'Monthly'}
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
            <span>{language === 'ar' ? 'سنوي' : 'Annual'}</span>
            <span
              className={cn(
                'text-[10px] font-extrabold px-1.5 py-0.5 rounded-full',
                billingCycle === 'yearly'
                  ? 'bg-brand-coral text-white'
                  : 'bg-brand-coral/15 text-brand-coral'
              )}
            >
              {language === 'ar' ? '-20%' : 'Save 20%'}
            </span>
          </button>
        </div>
      </div>

      {/* Current Active Plan Banner */}
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
              {currentSub?.plan.name || (language === 'ar' ? 'مجاني' : 'FREE')}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              {currentSub ? (
                <>
                  <span>{language === 'ar' ? 'صالح حتى:' : 'Renews on:'} </span>
                  <span dir="ltr">{new Date(currentSub.endDate).toLocaleDateString()}</span>
                </>
              ) : language === 'ar' ? (
                'خطة مجانية بدون تجديد تلقائي'
              ) : (
                'Free tier plan'
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

      {/* Available Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isCurrent = currentSub?.plan.id === plan.id
          const isPopular = plan.name === 'STARTUP'

          const displayPrice =
            billingCycle === 'yearly'
              ? plan.name === 'STARTUP'
                ? 19200
                : plan.name === 'PREMIUM'
                ? 48000
                : 0
              : plan.price

          const periodLabel =
            billingCycle === 'yearly'
              ? language === 'ar'
                ? '/ سنة'
                : '/ year'
              : language === 'ar'
              ? '/ شهر'
              : '/ month'

          const monthlyEquivalent =
            billingCycle === 'yearly' && plan.name === 'STARTUP'
              ? 1600
              : billingCycle === 'yearly' && plan.name === 'PREMIUM'
              ? 4000
              : null

          const savings =
            billingCycle === 'yearly' && plan.name === 'STARTUP'
              ? language === 'ar'
                ? 'وفّر 4 800 دج'
                : 'Save 4,800 DA'
              : billingCycle === 'yearly' && plan.name === 'PREMIUM'
              ? language === 'ar'
                ? 'وفّر 12 000 دج'
                : 'Save 12,000 DA'
              : null

          return (
            <div
              key={plan.id}
              className={cn(
                'bg-white rounded-3xl p-7 border transition-all duration-300 flex flex-col justify-between relative text-start',
                isCurrent
                  ? 'border-2 border-brand-blue shadow-lg'
                  : isPopular
                  ? 'border-2 border-brand-coral shadow-md'
                  : 'border-gray-100 shadow-xs hover:shadow-md'
              )}
            >
              {/* Badge for Popular or Current */}
              {isCurrent ? (
                <div className="absolute -top-3.5 start-6 bg-brand-blue text-white text-[10px] font-bold uppercase px-3 py-0.5 rounded-full shadow-sm">
                  {language === 'ar' ? 'خطتك الحالية' : 'Current Plan'}
                </div>
              ) : isPopular ? (
                <div className="absolute -top-3.5 start-6 bg-brand-coral text-white text-[10px] font-bold uppercase px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{language === 'ar' ? 'الأكثر شعبية' : 'Popular'}</span>
                </div>
              ) : null}

              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-1">{plan.name}</h3>

                {/* Price Block */}
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-baseline gap-1.5">
                    <span dir="ltr" className="text-3xl font-black text-brand-navy font-mono">
                      {displayPrice.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-brand-navy">
                      {language === 'ar' ? 'دج' : 'DA'}
                    </span>
                    <span className="text-xs text-brand-slate font-semibold">
                      {periodLabel}
                    </span>
                  </div>

                  {/* Savings & monthly breakdown */}
                  {monthlyEquivalent && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-brand-slate">
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
                <ul className="space-y-3 mb-8">
                  {Array.isArray(plan.features) &&
                    plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-brand-navy">
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                            isPopular
                              ? 'bg-brand-coral/15 text-brand-coral'
                              : 'bg-brand-teal/15 text-brand-teal'
                          )}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrent || upgradingPlanId !== null}
                className={cn(
                  'w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs',
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isPopular
                    ? 'btn-primary'
                    : 'btn-secondary'
                )}
              >
                {upgradingPlanId === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  <span>{language === 'ar' ? 'الخطة النشطة' : 'Active Plan'}</span>
                ) : (
                  <>
                    <span>
                      {language === 'ar'
                        ? `الترقية إلى ${plan.name} (${billingCycle === 'yearly' ? 'سنوي' : 'شهري'})`
                        : `Subscribe to ${plan.name} (${billingCycle})`}
                    </span>
                    <ArrowRight className={cn('w-3.5 h-3.5', language === 'ar' && 'rotate-180')} />
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
