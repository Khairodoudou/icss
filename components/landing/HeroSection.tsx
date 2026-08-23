'use client'

import { motion, type Variants } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function HeroSection() {
  const { messages, isRTL } = useLanguage()
  const { hero } = messages

  return (
    <section
      id="hero"
      className="relative min-h-screen bg-gradient-to-br from-brand-light via-white to-sky-50 pt-24 sm:pt-28 flex items-center overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 end-0 w-96 h-96 bg-brand-sky/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 start-0 w-80 h-80 bg-brand-teal/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/3 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* Text Content */}
          <div className="text-start">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-brand-coral animate-pulse" />
              {hero.badge}
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl sm:text-5xl xl:text-6xl font-bold text-brand-navy leading-tight mb-5"
            >
              {hero.title}
              <br />
              <span className="text-brand-blue">{hero.titleHighlight}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg text-brand-slate leading-relaxed mb-8 max-w-xl"
            >
              {hero.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Link href="/register" className="btn-primary">
                <span>{hero.cta1}</span>
                <ArrowRight className={cn('w-4 h-4 transition-transform', isRTL && 'rotate-180')} />
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('services')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-secondary cursor-pointer"
              >
                {hero.cta2}
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="flex flex-wrap gap-5"
            >
              {[hero.trust1, hero.trust2, hero.trust3].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal shrink-0" />
                  <span className="text-sm font-medium text-brand-slate">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-blue/15 border border-gray-100">
              <Image
                src="/hero-image.jpg"
                alt="Entrepreneurs working together"
                width={600}
                height={450}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/20 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-5 start-4 sm:start-6 bg-white rounded-2xl shadow-xl shadow-gray-200/80 p-4 flex items-center gap-4 border border-gray-100"
            >
              {/* Avatars */}
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {['#1D5B79', '#E97F6B', '#14B8A6', '#38BDF8'].map((color, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-start">
                <div dir="ltr" className="text-lg font-bold text-brand-navy font-mono text-start">+420</div>
                <div className="text-xs text-brand-slate max-w-[140px]">{hero.statsLabel}</div>
              </div>
            </motion.div>

            {/* Decorative shapes */}
            <div className="absolute -top-6 -end-6 w-24 h-24 bg-brand-coral/15 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 end-10 w-16 h-16 bg-brand-sky/20 rounded-full blur-lg pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
