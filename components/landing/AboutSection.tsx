'use client'

import { motion } from 'framer-motion'
import {
  Award,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  Target,
  CheckCircle2,
  Star,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const VALUE_ICONS = [
  {
    icon: Award,
    bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    hoverBorder: 'group-hover:border-amber-500/40',
    glow: 'group-hover:shadow-amber-500/10',
  },
  {
    icon: Sparkles,
    bg: 'bg-brand-sky/10 text-brand-sky border-brand-sky/20',
    hoverBorder: 'group-hover:border-brand-sky/40',
    glow: 'group-hover:shadow-brand-sky/10',
  },
  {
    icon: HeartHandshake,
    bg: 'bg-brand-coral/10 text-brand-coral border-brand-coral/20',
    hoverBorder: 'group-hover:border-brand-coral/40',
    glow: 'group-hover:shadow-brand-coral/10',
  },
  {
    icon: TrendingUp,
    bg: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20',
    hoverBorder: 'group-hover:border-brand-teal/40',
    glow: 'group-hover:shadow-brand-teal/10',
  },
]

export default function AboutSection() {
  const { messages, isRTL } = useLanguage()
  const { about } = messages

  return (
    <section
      id="about"
      className="section-padding bg-white relative overflow-hidden selection:bg-brand-sky/20 selection:text-brand-blue"
    >
      {/* Subtle Background Glow Orbs */}
      <div className="absolute top-1/4 start-0 w-96 h-96 bg-brand-sky/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-max relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-blue bg-brand-blue/10 border border-brand-blue/20 px-4 py-1.5 rounded-full mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-brand-coral animate-pulse" />
            {about.badge}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy mb-5 tracking-tight"
          >
            {about.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-brand-slate leading-relaxed max-w-2xl mx-auto"
          >
            {about.subtitle}
          </motion.p>
        </div>

        {/* Bento Content Grid: Image & Mission Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch mb-12">
          {/* Left Column: Image with Floating Stats (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex flex-col justify-center min-h-[380px] sm:min-h-[440px]"
          >
            {/* Main Rounded Image Container */}
            <div className="relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-3xl overflow-hidden shadow-2xl shadow-brand-navy/10 border border-gray-100 group">
              <Image
                src="/about-us.jpg"
                alt="ICSS Coaching & Training"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/20 to-transparent" />

              {/* Bottom In-Image Badge */}
              <div className="absolute bottom-5 inset-x-5 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-sky uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  <span>{about.experienceCard?.label || 'Coaching Expert'}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono">
                  {about.experienceCard?.number || '+5'} Years of Impact
                </div>
              </div>
            </div>

            {/* Top-Floating Card: Satisfaction & Rating */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -top-4 end-4 sm:-end-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl shadow-gray-200/90 border border-gray-100 flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-start">
                <div className="flex items-center gap-1">
                  <span className="text-base font-extrabold text-brand-navy font-mono">
                    {about.ratingCard?.rating || '4.9/5'}
                  </span>
                  <div className="flex text-amber-400">
                    {'★★★★★'.split('').map((s, i) => (
                      <span key={i} className="text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] font-medium text-brand-slate">
                  {about.ratingCard?.label || 'Satisfaction Client'}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Mission Card + Key Highlights (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between gap-6"
          >
            {/* Mission Hero Card */}
            <div className="relative bg-gradient-to-br from-brand-navy via-[#162238] to-[#1D5B79] rounded-3xl p-7 sm:p-9 text-white shadow-xl shadow-brand-navy/15 border border-white/10 overflow-hidden flex flex-col justify-between flex-1">
              {/* Background ambient decorative shapes */}
              <div className="absolute top-0 end-0 w-64 h-64 bg-brand-sky/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -start-10 w-48 h-48 bg-brand-teal/15 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                {/* Mission Header Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-brand-sky mb-5">
                  <Target className="w-4 h-4 text-brand-coral" />
                  <span>{about.mission}</span>
                </div>

                {/* Mission Statement */}
                <h3 className="text-xl sm:text-2xl font-bold leading-snug mb-4 text-white">
                  {about.missionText}
                </h3>

                {/* Bullet Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10">
                  {(about.highlights || []).map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action inside Mission Card */}
              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-gray-300">
                  {messages.hero.trust1} • {messages.hero.trust2} • {messages.hero.trust3}
                </p>

                <Link
                  href="/#programs"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-brand-coral hover:bg-brand-coral-dark px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-brand-coral/30 hover:-translate-y-0.5"
                >
                  <span>{about.cta || messages.hero.cta1}</span>
                  <ArrowRight
                    className={cn('w-4 h-4 transition-transform', isRTL && 'rotate-180')}
                  />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4 Pillars / Core Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {about.values.map((value, index) => {
            const config = VALUE_ICONS[index % VALUE_ICONS.length]
            const Icon = config.icon

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'group bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-start relative overflow-hidden',
                  config.hoverBorder,
                  config.glow
                )}
              >
                {/* Top Subtle Pill with Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border transition-transform duration-300 group-hover:scale-110 shadow-sm',
                    config.bg
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h4 className="text-lg font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">
                  {value.title}
                </h4>

                {/* Description */}
                <p className="text-xs sm:text-sm text-brand-slate leading-relaxed">
                  {value.description}
                </p>

                {/* Bottom decorative bar on hover */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
