'use client'

import { motion } from 'framer-motion'
import { Calendar, Users, Award, BookOpen } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const PROGRAM_META = [
  {
    image: '/programs/business-english.jpg',
    icon: BookOpen,
    badgeColor: 'bg-[#1D5B79]',
    iconColor: 'bg-[#1D5B79] text-white',
  },
  {
    image: '/programs/pitch-presentation.jpg',
    icon: Award,
    badgeColor: 'bg-[#EAB308]',
    iconColor: 'bg-[#EAB308] text-white',
  },
  {
    image: '/programs/international-comm.jpg',
    icon: Users,
    badgeColor: 'bg-[#14B8A6]',
    iconColor: 'bg-[#14B8A6] text-white',
  },
  {
    image: '/programs/digital-comm.jpg',
    icon: Calendar,
    badgeColor: 'bg-[#8B5CF6]',
    iconColor: 'bg-[#8B5CF6] text-white',
  },
]

export default function ProgramsSection() {
  const { messages } = useLanguage()
  const { programs } = messages

  return (
    <section id="programs" className="section-padding bg-white">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-3"
          >
            {programs.badge}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4 tracking-tight"
          >
            {programs.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-brand-slate"
          >
            {programs.subtitle}
          </motion.p>
        </div>

        {/* Programs 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {programs.items.map((item, index) => {
            const meta = PROGRAM_META[index % PROGRAM_META.length]
            const Icon = meta.icon

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 text-start"
              >
                <div>
                  {/* Image container with tags */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={meta.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Small Icon Badge */}
                    <div
                      className={cn(
                        'absolute bottom-3 start-3 w-8 h-8 rounded-lg flex items-center justify-center shadow-md',
                        meta.iconColor
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Sessions badge */}
                    <div className="absolute top-3 end-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-brand-navy shadow-sm">
                      <span dir="ltr">{item.sessions}</span> {programs.sessions}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-brand-navy mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brand-slate leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Price & CTA */}
                <div className="p-6 pt-0 border-t border-gray-50 mt-auto">
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-start">
                      <span className="text-[10px] text-brand-slate block uppercase font-bold tracking-wider">
                        {programs.priceLabel}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span dir="ltr" className="text-xl font-extrabold text-brand-blue font-mono">
                          {item.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-brand-blue">
                          {programs.currency}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/register"
                      className="text-xs font-bold text-white bg-brand-coral hover:bg-brand-coral-dark px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      {programs.enroll}
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
