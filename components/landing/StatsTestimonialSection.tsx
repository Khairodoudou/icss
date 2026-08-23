'use client'

import { motion } from 'framer-motion'
import { Users2, CheckCircle, Smile, UserCheck, Quote } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function StatsTestimonialSection() {
  const { messages, isRTL } = useLanguage()
  const { stats } = messages

  const statsItems = [
    { value: '+420', label: stats.entrepreneurs, icon: Users2 },
    { value: '+850', label: stats.projects, icon: CheckCircle },
    { value: '98%', label: stats.satisfaction, icon: Smile },
    { value: '+25', label: stats.experts, icon: UserCheck },
  ]

  return (
    <section className="bg-[#0F172A] text-white py-16 lg:py-20 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* 4 Statistics (Span 7 cols) */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {statsItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-sky mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span dir="ltr" className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight font-mono">
                      {item.value}
                    </span>
                    <span className="text-xs text-gray-400 font-medium leading-tight">
                      {item.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Testimonial Card (Span 5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-sm relative flex flex-col sm:flex-row items-center sm:items-start gap-5 text-start">
              {/* Founder Avatar */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-sky shadow-lg">
                  <Image
                    src="/testimonials/sarah.jpg"
                    alt="Sarah B."
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-brand-coral flex items-center justify-center text-white text-xs">
                  <Quote className="w-3 h-3" />
                </div>
              </div>

              {/* Quote & Author info */}
              <div className="flex-1">
                <p className="text-sm text-gray-200 italic leading-relaxed mb-4">
                  {stats.testimonial}
                </p>
                <div>
                  <div className="text-sm font-bold text-white">{stats.testimonialAuthor}</div>
                  <div className="text-xs text-brand-sky">{stats.testimonialRole}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
