'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Mail, Phone, MapPin, ExternalLink, Compass } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

export default function FaqContactSection() {
  const { messages, isRTL } = useLanguage()
  const { faq, contact } = messages
  const [openFaq, setOpenFaq] = useState<number | null>(0) // First open by default

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section id="faq" className="section-padding bg-[#F8FAFC]">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* FAQ Column (Starts at Start: Right in Arabic, Left in English) */}
          <div className="lg:col-span-6 text-start">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-3">
                {faq.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2 tracking-tight">
                {faq.title}
              </h2>
              <p className="text-xs sm:text-sm text-brand-slate">
                {faq.subtitle}
              </p>
            </div>

            {/* Accordion list */}
            <div className="space-y-3">
              {faq.items.map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-brand-navy hover:text-brand-blue transition-colors text-start cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 shrink-0 text-brand-slate transition-transform duration-300',
                          isOpen && 'rotate-180 text-brand-blue'
                        )}
                      />
                    </button>

                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-brand-slate leading-relaxed border-t border-gray-50 text-start"
                      >
                        {item.answer}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Location & Map Column (Starts at End: Left in Arabic, Right in English) */}
          <div id="contact" className="lg:col-span-6 text-start">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-3">
                {contact.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2 tracking-tight">
                {contact.title}
              </h2>
              <p className="text-xs sm:text-sm text-brand-slate">
                {contact.subtitle}
              </p>
            </div>

            {/* Contact Information quick badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden text-start">
                  <div className="text-[10px] text-brand-slate uppercase font-bold">{contact.info.emailLabel}</div>
                  <div className="text-xs font-semibold text-brand-navy truncate">{contact.info.email}</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="overflow-hidden text-start">
                  <div className="text-[10px] text-brand-slate uppercase font-bold">{contact.info.phoneLabel}</div>
                  <div className="text-xs font-semibold text-brand-navy truncate" dir="ltr">{contact.info.phone}</div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="overflow-hidden text-start">
                  <div className="text-[10px] text-brand-slate uppercase font-bold">{contact.info.addressLabel}</div>
                  <div className="text-xs font-semibold text-brand-navy truncate">{contact.info.address}</div>
                </div>
              </div>
            </div>

            {/* Interactive Algeria Map Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm overflow-hidden">
              {/* Map Header Bar */}
              <div className="flex items-center justify-between pb-3 px-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-coral animate-spin-slow" />
                  <span className="text-xs font-bold text-brand-navy">
                    {isRTL ? 'موقعنا على الخريطة — الجزائر' : 'Our Location — Algeria'}
                  </span>
                </div>

                <a
                  href="https://maps.google.com/?q=Oran,Algeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-blue hover:text-brand-coral transition-colors"
                >
                  <span>{isRTL ? 'عرض في الخرائط' : 'Open in Maps'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Responsive Google Maps Embed */}
              <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-100">
                <iframe
                  title="Algeria Map Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d103757.34863612806!2d-0.6974246835937499!3d35.6987388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7e8854841f450d%3A0x1d0cfba235e2e8e!2sOran%2C%20Algeria!5e0!3m2!1sen!2sdz!4v1700000000000!5m2!1sen!2sdz"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[10%] contrast-[105%]"
                />

                {/* Location Badge Floating on Map */}
                <div className="absolute bottom-3 start-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-coral animate-ping" />
                  <div className="text-start">
                    <div className="text-xs font-bold text-brand-navy">ICSS Platform</div>
                    <div className="text-[10px] text-brand-slate">Oran & Alger, Algérie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
