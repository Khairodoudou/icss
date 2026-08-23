'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Globe } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { key: 'home', href: '/#hero' },
  { key: 'about', href: '/#about' },
  { key: 'services', href: '/#services' },
  { key: 'programs', href: '/#programs' },
  { key: 'howItWorks', href: '/#how-it-works' },
  { key: 'pricing', href: '/#pricing' },
  { key: 'faq', href: '/#faq' },
  { key: 'contact', href: '/#contact' },
] as const

export default function Navbar() {
  const { messages, language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      if (pathname === '/') {
        const sections = ['hero', 'about', 'services', 'programs', 'how-it-works', 'pricing', 'faq', 'contact']
        for (const section of sections.reverse()) {
          const el = document.getElementById(section)
          if (el && el.getBoundingClientRect().top <= 120) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)
    const targetId = href.replace('/#', '')

    if (pathname === '/') {
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(href)
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-2'
          : 'bg-white/90 backdrop-blur-sm py-3 sm:py-4'
      )}
    >
      <nav className="container-max">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo (Bigger & Responsive) */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="relative h-12 sm:h-14 md:h-16 w-44 sm:w-52 md:w-60">
              <Image
                src="/logo.jpg"
                alt="ICSS Platform"
                fill
                className="object-contain object-start"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav Links (Centered) */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const targetId = link.href.replace('/#', '')
              const isActive = pathname === '/' && activeSection === targetId

              return (
                <button
                  key={link.key}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    'px-3 py-2 text-xs xl:text-sm font-semibold rounded-lg transition-colors duration-200 cursor-pointer',
                    isActive
                      ? 'text-brand-blue bg-brand-blue/10'
                      : 'text-brand-slate hover:text-brand-navy hover:bg-gray-50'
                  )}
                >
                  {messages.nav[link.key as keyof typeof messages.nav]}
                </button>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 text-xs xl:text-sm font-bold text-brand-slate hover:text-brand-blue transition-colors px-3 py-2 rounded-xl hover:bg-gray-50 border border-gray-200/70 cursor-pointer"
              aria-label="Switch language"
            >
              <Globe className="w-4 h-4 text-brand-blue" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <Link
              href="/login"
              className="text-xs xl:text-sm font-bold text-brand-blue border-2 border-brand-blue/30 px-4 py-2 rounded-xl hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all duration-200"
            >
              {messages.nav.login}
            </Link>

            <Link
              href="/register"
              className="text-xs xl:text-sm font-bold text-white bg-brand-coral px-4 py-2 rounded-xl hover:bg-brand-coral-dark transition-all duration-200 shadow-sm hover:shadow-brand-coral/30 hover:shadow-md"
            >
              {messages.nav.register}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="p-2 text-xs font-bold text-brand-slate border border-gray-200 rounded-lg"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>

            <button
              className="p-2 rounded-lg text-brand-slate hover:text-brand-navy hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white pb-6 pt-3 px-2 mt-2 rounded-2xl shadow-xl">
            <div className="flex flex-col gap-1 mb-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.key}
                  onClick={() => handleNavClick(link.href)}
                  className="w-full text-start px-4 py-2.5 text-sm font-semibold rounded-xl text-brand-slate hover:text-brand-navy hover:bg-gray-50 transition-colors"
                >
                  {messages.nav[link.key as keyof typeof messages.nav]}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link
                href="/login"
                className="text-center text-sm font-bold text-brand-blue border border-brand-blue/40 py-2.5 rounded-xl hover:bg-brand-blue hover:text-white transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {messages.nav.login}
              </Link>

              <Link
                href="/register"
                className="text-center text-sm font-bold text-white bg-brand-coral py-2.5 rounded-xl hover:bg-brand-coral-dark transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                {messages.nav.register}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
