'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, Zap } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function PricingSection() {
  const { messages } = useLanguage()
  const { pricing } = messages
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="section-padding bg-white relative">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-3"
          >
            {pricing.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4 tracking-tight"
          >
            {pricing.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-brand-slate"
          >
            {pricing.subtitle}
          </motion.p>

          {/* Monthly / Annual Billing Toggle Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 inline-flex items-center gap-3 p-1.5 bg-gray-100/90 backdrop-blur-sm rounded-2xl border border-gray-200"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer',
                billingCycle === 'monthly'
                  ? 'bg-white text-brand-navy shadow-sm'
                  : 'text-brand-slate hover:text-brand-navy'
              )}
            >
              {pricing.billingMonthly}
            </button>

            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer',
                billingCycle === 'yearly'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-brand-slate hover:text-brand-navy'
              )}
            >
              <span>{pricing.billingYearly}</span>
              <span
                className={cn(
                  'text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-colors',
                  billingCycle === 'yearly'
                    ? 'bg-brand-coral text-white'
                    : 'bg-brand-coral/15 text-brand-coral'
                )}
              >
                {pricing.yearlyDiscount}
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricing.plans.map((plan, index) => {
            const isPopular = index === 1 // Startup plan
            const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
            const periodLabel = billingCycle === 'yearly' ? pricing.perYear : pricing.perMonth

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'relative rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between text-start',
                  isPopular
                    ? 'bg-white border-2 border-brand-coral shadow-2xl shadow-brand-coral/10 lg:-translate-y-2'
                    : 'bg-white border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1'
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 start-8 bg-brand-coral text-white text-xs font-extrabold uppercase px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{pricing.popular}</span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Description */}
                  <h3 className="text-2xl font-bold text-brand-navy mb-1">{plan.name}</h3>
                  <p className="text-xs text-brand-slate mb-6 min-h-[32px]">{plan.description}</p>

                  {/* Price Block with BiDi Protection */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-baseline gap-1.5">
                      <span dir="ltr" className="text-4xl sm:text-5xl font-black text-brand-navy font-mono tracking-tight">
                        {price.toLocaleString()}
                      </span>
                      <span className="text-base font-bold text-brand-navy">
                        {pricing.currency}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-brand-slate">
                        {periodLabel}
                      </span>
                    </div>

                    {/* Annual breakdown & savings */}
                    {billingCycle === 'yearly' && plan.yearlyMonthlyEquivalent && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-brand-slate">
                          (~<span dir="ltr">{plan.yearlyMonthlyEquivalent.toLocaleString()}</span> {pricing.currency} {pricing.perMonth})
                        </span>
                        {plan.savings && (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            {plan.savings}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3 text-sm text-brand-navy">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                            isPopular
                              ? 'bg-brand-coral/15 text-brand-coral'
                              : 'bg-brand-teal/15 text-brand-teal'
                          )}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Link
                  href="/register"
                  className={cn(
                    'w-full py-3.5 px-6 rounded-2xl font-bold text-center text-xs sm:text-sm transition-all duration-200 block shadow-sm cursor-pointer',
                    isPopular
                      ? 'bg-brand-coral text-white hover:bg-brand-coral-dark hover:shadow-lg hover:shadow-brand-coral/25'
                      : 'border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white'
                  )}
                >
                  {index === 0 ? pricing.ctaFree : pricing.cta}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
