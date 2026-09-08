'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { GraduationCap, Lightbulb, Code2, Sparkles } from 'lucide-react'

export default function UniversityBannerSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#0f2744] to-[#0c1f3a] py-14 md:py-20">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#38BDF8 1px, transparent 1px), linear-gradient(90deg, #38BDF8 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand-sky/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-teal/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-max relative z-10">
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase text-brand-sky">
            <Sparkles className="w-3.5 h-3.5 text-brand-coral" />
            Academic Partnership
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm overflow-hidden"
        >
          {/* Inner glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-sky/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-coral/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* University Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex-shrink-0"
            >
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-sky/30 to-brand-teal/20 blur-xl scale-110 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-white/10 border-2 border-white/20 group-hover:border-brand-sky/50 transition-colors duration-500 flex items-center justify-center overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-sm">
                  <Image
                    src="/university_logo.jpg"
                    alt="Biskra University"
                    fill
                    sizes="(max-width: 768px) 144px, 176px"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Vertical divider on desktop */}
            <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-white/15 to-transparent" />
            {/* Horizontal divider on mobile */}
            <div className="block lg:hidden h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Content */}
            <div className="flex-1 text-center lg:text-start">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-wrap items-center gap-2.5 justify-center lg:justify-start mb-4"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-sky" />
                  <span className="text-brand-sky text-sm font-semibold tracking-wide">
                    Université Mohamed Khider — Biskra
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-brand-coral/10 border border-brand-coral/30 text-brand-coral text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <Lightbulb className="w-3 h-3 text-brand-coral" />
                  Programme Startup 2025/2026
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-5"
              >
                Built within a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-teal">
                  Startup Project
                </span>{' '}
                <br className="hidden sm:block" />
                at Biskra University
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.32, duration: 0.5 }}
                className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              >
                This platform was developed as part of the{' '}
                <span className="text-white font-medium">Programme Startup 2025/2026</span> initiative at{' '}
                <span className="text-white font-medium">Biskra University</span>, bridging academic
                innovation with real-world digital solutions in coaching and professional development.
              </motion.p>

              {/* Creator & Supervisor cards */}
              <div className="flex flex-col gap-3 items-center lg:items-start">
                {/* Creator card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="w-full sm:w-auto sm:min-w-[300px] inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-sm hover:border-brand-sky/30 hover:bg-white/[0.08] transition-all duration-300 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-sky to-brand-teal flex items-center justify-center shrink-0 shadow-lg shadow-brand-sky/20">
                    <Code2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-start">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-sky/70">
                        Created by
                      </span>
                      <Lightbulb className="w-3 h-3 text-brand-coral" />
                    </div>
                    <p className="text-white font-bold text-base group-hover:text-brand-sky transition-colors duration-300">
                      Mr. Telli Abdelmoutia
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Developer &amp; Startup Founder</p>
                  </div>
                </motion.div>

                {/* Supervisor card - under created */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="w-full sm:w-auto sm:min-w-[300px] inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-sm hover:border-brand-coral/30 hover:bg-white/[0.08] transition-all duration-300 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-coral to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-coral/20">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-start">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-coral">
                        Supervised by
                      </span>
                      <Sparkles className="w-3 h-3 text-brand-sky" />
                    </div>
                    <p className="text-white font-bold text-base group-hover:text-brand-coral transition-colors duration-300">
                      Ben Moussa Yasser
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Project Supervisor</p>
                  </div>
                </motion.div>
              </div>

              {/* Mobile stats cards */}
              <div className="flex lg:hidden flex-wrap items-center justify-center gap-2.5 mt-6">
                {[
                  {
                    icon: GraduationCap,
                    label: 'Université',
                    value: 'Biskra',
                    color: 'text-brand-sky',
                    border: 'border-brand-sky/20',
                    iconBg: 'bg-brand-sky/10',
                  },
                  {
                    icon: Lightbulb,
                    label: 'Programme',
                    value: 'Startup 2025/2026',
                    color: 'text-brand-coral',
                    border: 'border-brand-coral/20',
                    iconBg: 'bg-brand-coral/10',
                  },
                  {
                    icon: Code2,
                    label: 'Framework',
                    value: 'Next.js',
                    color: 'text-brand-teal',
                    border: 'border-brand-teal/20',
                    iconBg: 'bg-brand-teal/10',
                  },
                ].map(({ icon: Icon, label, value, color, border, iconBg }, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 bg-white/5 border ${border} rounded-xl px-3 py-2 backdrop-blur-sm`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${iconBg} border ${border} flex items-center justify-center`}>
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-[9px] uppercase tracking-wider font-semibold">{label}</p>
                      <p className={`font-bold text-xs ${color}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right decorative stats — desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="hidden lg:flex flex-col gap-4 shrink-0"
            >
              {[
                {
                  icon: GraduationCap,
                  label: 'Université',
                  value: 'Biskra',
                  color: 'text-brand-sky',
                  border: 'border-brand-sky/20',
                  iconBg: 'bg-brand-sky/10',
                },
                {
                  icon: Lightbulb,
                  label: 'Programme',
                  value: 'Startup 2025/2026',
                  color: 'text-brand-coral',
                  border: 'border-brand-coral/20',
                  iconBg: 'bg-brand-coral/10',
                },
                {
                  icon: Code2,
                  label: 'Framework',
                  value: 'Next.js',
                  color: 'text-brand-teal',
                  border: 'border-brand-teal/20',
                  iconBg: 'bg-brand-teal/10',
                },
              ].map(({ icon: Icon, label, value, color, border, iconBg }, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 bg-white/5 border ${border} rounded-xl px-4 py-3 backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
                >
                  <div className={`w-9 h-9 rounded-lg ${iconBg} border ${border} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
                    <p className={`font-bold text-sm ${color}`}>{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom decorative dots */}
        <div className="flex justify-center mt-8 gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className={`rounded-full ${i === 1 ? 'w-4 h-2 bg-brand-sky' : 'w-2 h-2 bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
