'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Footer() {
  const { messages, isRTL } = useLanguage()
  const { footer } = messages
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success('Thank you for subscribing to our newsletter!')
    setEmail('')
  }

  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8 border-t border-white/5">
      <div className="container-max">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10 text-start">
          {/* Col 1: Brand & Logo & Bio (Span 4 cols) */}
          <div className="lg:col-span-4">
            {/* Logo in clean enlarged container */}
            <Link href="/" className="inline-block mb-6">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-md inline-flex items-center">
                <Image
                  src="/logo.jpg"
                  alt="ICSS Platform"
                  width={180}
                  height={52}
                  className="h-11 sm:h-13 w-auto object-contain"
                />
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed mb-6 max-w-sm">
              {footer.description}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: FaFacebookF, href: 'https://facebook.com' },
                { icon: FaLinkedinIn, href: 'https://linkedin.com' },
                { icon: FaInstagram, href: 'https://instagram.com' },
                { icon: FaYoutube, href: 'https://youtube.com' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-blue flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Col 2: Quick Links (Span 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/#hero" className="hover:text-brand-sky transition-colors">{footer.links.home}</Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-brand-sky transition-colors">{footer.links.about}</Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-brand-sky transition-colors">{footer.links.services}</Link>
              </li>
              <li>
                <Link href="/#programs" className="hover:text-brand-sky transition-colors">{footer.links.programs}</Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-brand-sky transition-colors">{messages.nav.pricing}</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources (Span 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {footer.resources}
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/#services" className="hover:text-brand-sky transition-colors">{footer.links.blog}</Link>
              </li>
              <li>
                <Link href="/#programs" className="hover:text-brand-sky transition-colors">{footer.links.guides}</Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-sky transition-colors">{footer.links.faq}</Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-brand-sky transition-colors">{footer.links.testimonials}</Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-brand-sky transition-colors">{messages.nav.contact}</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Newsletter (Span 4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {footer.legal}
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 mb-6">
              <li>
                <Link href="/#faq" className="hover:text-brand-sky transition-colors">{footer.links.terms}</Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-sky transition-colors">{footer.links.privacy}</Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-sky transition-colors">{footer.links.legal}</Link>
              </li>
            </ul>

            {/* Newsletter form */}
            <div>
              <h5 className="text-xs font-semibold text-white mb-1">{footer.newsletter.title}</h5>
              <p className="text-[11px] text-gray-400 mb-3">{footer.newsletter.subtitle}</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder={footer.newsletter.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border border-white/10 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-sky flex-1 text-start"
                />
                <button
                  type="submit"
                  className="bg-brand-coral hover:bg-brand-coral-dark px-4 py-2.5 rounded-xl text-white transition-colors flex items-center justify-center shrink-0 shadow-md cursor-pointer"
                  aria-label="Subscribe to newsletter"
                >
                  <Send className={cn('w-3.5 h-3.5', isRTL && 'rotate-180')} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 text-center text-xs text-gray-500">
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
