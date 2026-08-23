'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CalendarCheck2,
  Percent,
  LogOut,
  Menu,
  X,
  Globe,
  Loader2,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, isRTL } = useLanguage()

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.data.user.role === 'ADMIN') {
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
    verifyAdmin()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Logout error')
    }
  }

  const ADMIN_NAV = [
    {
      label: language === 'ar' ? 'لوحة التحكم' : 'Overview & Stats',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: language === 'ar' ? 'المستخدمين' : 'Users Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: language === 'ar' ? 'الطلبات' : 'Service Requests',
      href: '/admin/requests',
      icon: FileText,
    },
    {
      label: language === 'ar' ? 'الخدمات' : 'Services Catalog',
      href: '/admin/services',
      icon: Briefcase,
    },
    {
      label: language === 'ar' ? 'الحجوزات' : 'Bookings',
      href: '/admin/bookings',
      icon: CalendarCheck2,
    },
    {
      label: language === 'ar' ? 'العمولات والمعاملات' : 'Commissions & Sales',
      href: '/admin/commissions',
      icon: Percent,
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
      <div className="lg:hidden bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-white px-2 py-1 rounded-lg">
            <Image
              src="/logo.jpg"
              alt="ICSS Admin"
              width={90}
              height={28}
              className="h-6 w-auto object-contain"
            />
          </div>
          <span className="text-xs font-bold text-brand-coral uppercase tracking-wider">Admin</span>
        </Link>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-300">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="inline-block">
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
                <Image
                  src="/logo.jpg"
                  alt="ICSS Admin"
                  width={120}
                  height={36}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>
            </Link>

            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin User Preview */}
          <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-coral text-white font-bold flex items-center justify-center shrink-0 border border-brand-coral/30">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden text-start">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-brand-coral font-bold uppercase tracking-wider">
                Administrator
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {ADMIN_NAV.map((item) => {
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
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-coral' : 'text-gray-400')} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'Language: EN' : 'اللغة: العربية'}</span>
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

      {/* Admin Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
