'use client'

import { motion } from 'framer-motion'
import { MessageSquare, MonitorPlay, Globe2, Laptop, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const SERVICE_ICONS = [
  { icon: MessageSquare, bg: 'bg-[#1D5B79]', text: 'text-white' },
  { icon: MonitorPlay, bg: 'bg-[#EAB308]', text: 'text-white' },
  { icon: Globe2, bg: 'bg-[#14B8A6]', text: 'text-white' },
  { icon: Laptop, bg: 'bg-[#8B5CF6]', text: 'text-white' },
]

export default function ServicesSection() {
  const { messages, isRTL } = useLanguage()
  const { services } = messages

  return (
    <section id="services" className="section-padding bg-[#F8FAFC]">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-3"
          >
            {services.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4 tracking-tight"
          >
            {services.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-brand-slate"
          >
            {services.subtitle}
          </motion.p>
        </div>

        {/* Services 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {services.items.map((item, index) => {
            const iconConfig = SERVICE_ICONS[index % SERVICE_ICONS.length]
            const Icon = iconConfig.icon

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 text-start"
              >
                <div>
                  {/* Icon Circle */}
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform duration-300 group-hover:scale-110',
                      iconConfig.bg,
                      iconConfig.text
                    )}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-brand-navy mb-3 group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-brand-slate leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Action Link */}
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue group-hover:text-brand-coral transition-colors pt-4 border-t border-gray-50"
                >
                  <span>{services.learnMore}</span>
                  <ArrowRight
                    className={cn(
                      'w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1',
                      isRTL && 'rotate-180'
                    )}
                  />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
