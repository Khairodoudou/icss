'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  FileText,
  CalendarCheck2,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  Globe,
  Loader2,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, isRTL } = useLanguage()

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          setUser(data.data.user)
        } else {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Logout error')
    }
  }

  const NAV_ITEMS = [
    {
      label: language === 'ar' ? 'الرئيسية' : 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: language === 'ar' ? 'الخدمات' : 'Services',
      href: '/dashboard/services',
      icon: Briefcase,
    },
    {
      label: language === 'ar' ? 'طلباتي' : 'My Requests',
      href: '/dashboard/requests',
      icon: FileText,
    },
    {
      label: language === 'ar' ? 'حجوزاتي' : 'My Bookings',
      href: '/dashboard/bookings',
      icon: CalendarCheck2,
    },
    {
      label: language === 'ar' ? 'اشتراكي' : 'Subscription',
      href: '/dashboard/subscription',
      icon: Layers,
    },
    {
      label: language === 'ar' ? 'مدفوعاتي' : 'Payments',
      href: '/dashboard/payments',
      icon: CreditCard,
    },
    {
      label: language === 'ar' ? 'ملفي الشخصي' : 'My Profile',
      href: '/dashboard/profile',
      icon: User,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Mobile Topbar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-xs">
            <Image
              src="/logo.jpg"
              alt="ICSS"
              width={100}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="p-2 text-brand-slate hover:text-brand-blue rounded-lg text-xs font-bold"
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-brand-slate hover:text-brand-navy rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full',
          isRTL ? 'right-0 text-right' : 'left-0 text-left'
        )}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/" className="inline-block">
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-md flex items-center">
                <Image
                  src="/logo.jpg"
                  alt="ICSS Platform"
                  width={130}
                  height={38}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Preview */}
          <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center shrink-0 border border-brand-sky/30">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden text-start">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-sky' : 'text-gray-400')} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'English (LTR)' : 'العربية (RTL)'}</span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded">
              {language === 'en' ? 'AR' : 'EN'}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
