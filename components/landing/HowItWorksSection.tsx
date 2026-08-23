'use client'

import { motion } from 'framer-motion'
import { UserCheck, Layers, CalendarCheck2, CreditCard, Rocket } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

const STEP_ICONS = [UserCheck, Layers, CalendarCheck2, CreditCard, Rocket]

export default function HowItWorksSection() {
  const { messages } = useLanguage()
  const { howItWorks } = messages

  return (
    <section id="how-it-works" className="section-padding bg-[#F8FAFC] relative overflow-hidden">
      <div className="container-max relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-3"
          >
            {howItWorks.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4 tracking-tight"
          >
            {howItWorks.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-brand-slate"
          >
            {howItWorks.subtitle}
          </motion.p>
        </div>

        {/* 5 Steps Grid with Connecting Line */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div
            className="hidden lg:block absolute top-12 start-[10%] end-[10%] h-0.5 border-t-2 border-dashed border-brand-sky/30 pointer-events-none z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {howItWorks.steps.map((step, index) => {
              const Icon = STEP_ICONS[index % STEP_ICONS.length]
              const stepNumber = index + 1

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step Icon Circle */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-white border-2 border-brand-sky/20 flex items-center justify-center shadow-lg shadow-brand-blue/5 group-hover:border-brand-blue group-hover:shadow-brand-blue/20 transition-all duration-300 group-hover:scale-105">
                      <div className="w-16 h-16 rounded-full bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>

                    {/* Step Number Badge */}
                    <div className="absolute -bottom-2 start-0 w-7 h-7 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center shadow-md border-2 border-white">
                      {stepNumber}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-brand-slate leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
