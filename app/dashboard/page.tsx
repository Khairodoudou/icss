'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Layers,
  FileText,
  CalendarCheck2,
  CreditCard,
  ArrowUpRight,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

export default function DashboardHome() {
  const { language, isRTL } = useLanguage()

  const [userData, setUserData] = useState<{
    user: { name: string; email: string }
    subscription: { plan: { name: string; price: number } } | null
    requests: Array<{ id: string; service: { title: string }; status: string; createdAt: string }>
    bookings: Array<{ id: string; service: { title: string }; date: string; time: string; status: string }>
    payments: Array<{ id: string; amount: number; paymentType: string; status: string; createdAt: string }>
  }>({
    user: { name: 'Entrepreneur', email: '' },
    subscription: null,
    requests: [],
    bookings: [],
    payments: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, subRes, reqRes, bookRes, payRes] = await Promise.all([
          fetch('/api/auth/me').then((r) => r.json()),
          fetch('/api/subscriptions').then((r) => r.json()),
          fetch('/api/requests').then((r) => r.json()),
          fetch('/api/bookings').then((r) => r.json()),
          fetch('/api/payments').then((r) => r.json()),
        ])

        setUserData({
          user: meRes.data?.user || { name: 'Entrepreneur', email: '' },
          subscription: subRes.data?.currentSubscription || null,
          requests: reqRes.data || [],
          bookings: bookRes.data || [],
          payments: payRes.data || [],
        })
      } catch (e) {
        console.error('Failed to load dashboard:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  const pendingRequestsCount = userData.requests.filter((r) => r.status === 'PENDING').length
  const upcomingBookingsCount = userData.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length
  const totalPaid = userData.payments.reduce((sum, p) => sum + p.amount, 0)

  const STATUS_LABELS: Record<string, { en: string; ar: string; class: string }> = {
    PENDING: { en: 'Pending', ar: 'قيد المعالجة', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { en: 'Approved', ar: 'مقبول', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { en: 'In Progress', ar: 'قيد الإنجاز', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    COMPLETED: { en: 'Completed', ar: 'مكتمل', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { en: 'Rejected', ar: 'مرفوض', class: 'bg-red-50 text-red-700 border-red-200' },
    CONFIRMED: { en: 'Confirmed', ar: 'مؤكد', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغى', class: 'bg-gray-50 text-gray-700 border-gray-200' },
  }

  return (
    <div className="space-y-8 text-start">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {language === 'ar' ? `مرحباً، ${userData.user.name}` : `Welcome back, ${userData.user.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'إليك ملخص شامل لنشاطك، طلباتك وحجوزاتك الحالية.'
              : "Here's an overview of your active services, requests, and bookings."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/services"
            className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'طلب خدمة جديدة' : 'New Request'}</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Subscription */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-slate uppercase">
              {language === 'ar' ? 'الاشتراك الحالي' : 'Active Plan'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-brand-navy">
              {userData.subscription?.plan?.name || (language === 'ar' ? 'مجاني' : 'FREE')}
            </div>
            <Link
              href="/dashboard/subscription"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline mt-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'إدارة الاشتراك' : 'Manage Plan'}</span>
              <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-270')} />
            </Link>
          </div>
        </div>

        {/* Card 2: Pending Requests */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-slate uppercase">
              {language === 'ar' ? 'طلبات قيد المعالجة' : 'Pending Requests'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-sky/15 text-sky-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div dir="ltr" className="text-2xl font-black text-brand-navy font-mono text-start">{pendingRequestsCount}</div>
            <Link
              href="/dashboard/requests"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline mt-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'عرض الطلبات' : 'View Requests'}</span>
              <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-270')} />
            </Link>
          </div>
        </div>

        {/* Card 3: Upcoming Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-slate uppercase">
              {language === 'ar' ? 'الحجوزات القادمة' : 'Upcoming Bookings'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div dir="ltr" className="text-2xl font-black text-brand-navy font-mono text-start">{upcomingBookingsCount}</div>
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline mt-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'جدول المواعيد' : 'View Calendar'}</span>
              <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-270')} />
            </Link>
          </div>
        </div>

        {/* Card 4: Total Payments */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-slate uppercase">
              {language === 'ar' ? 'إجمالي المدفوعات' : 'Total Paid'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-coral/15 text-brand-coral flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1 text-2xl font-black text-brand-navy">
              <span dir="ltr" className="font-mono">{totalPaid.toLocaleString()}</span>
              <span className="text-sm">{language === 'ar' ? 'دج' : 'DA'}</span>
            </div>
            <Link
              href="/dashboard/payments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-coral hover:underline mt-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</span>
              <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-270')} />
            </Link>
          </div>
        </div>
      </div>

      {/* Two-Column Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Requests */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-brand-navy">
              {language === 'ar' ? 'آخر الطلبات' : 'Recent Service Requests'}
            </h2>
            <Link href="/dashboard/requests" className="text-xs font-semibold text-brand-blue hover:underline">
              {language === 'ar' ? 'عرض الكل' : 'View all'}
            </Link>
          </div>

          {userData.requests.length === 0 ? (
            <div className="text-center py-8 text-xs text-brand-slate">
              {language === 'ar' ? 'لا توجد طلبات بعد. ابدأ بطلب خدمة الآن!' : 'No service requests yet. Submit your first request!'}
            </div>
          ) : (
            <div className="space-y-3">
              {userData.requests.slice(0, 4).map((req) => {
                const statusMeta = STATUS_LABELS[req.status] || {
                  en: req.status,
                  ar: req.status,
                  class: 'bg-gray-100 text-gray-700',
                }
                return (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-brand-navy">{req.service.title}</h4>
                      <span className="text-[11px] text-brand-slate" dir="ltr">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full border',
                        statusMeta.class
                      )}
                    >
                      {language === 'ar' ? statusMeta.ar : statusMeta.en}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-brand-navy">
              {language === 'ar' ? 'الحجوزات القادمة' : 'Upcoming Bookings'}
            </h2>
            <Link href="/dashboard/bookings" className="text-xs font-semibold text-brand-blue hover:underline">
              {language === 'ar' ? 'عرض الكل' : 'View all'}
            </Link>
          </div>

          {userData.bookings.length === 0 ? (
            <div className="text-center py-8 text-xs text-brand-slate">
              {language === 'ar' ? 'لا توجد جلسات محجوزة حالياً.' : 'No sessions booked currently.'}
            </div>
          ) : (
            <div className="space-y-3">
              {userData.bookings.slice(0, 4).map((booking) => {
                const statusMeta = STATUS_LABELS[booking.status] || {
                  en: booking.status,
                  ar: booking.status,
                  class: 'bg-gray-100 text-gray-700',
                }
                return (
                  <div
                    key={booking.id}
                    className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-brand-navy">{booking.service.title}</h4>
                      <span className="text-[11px] text-brand-slate flex items-center gap-1 mt-0.5" dir="ltr">
                        <Clock className="w-3 h-3" />
                        {booking.date} — {booking.time}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2.5 py-1 rounded-full border',
                        statusMeta.class
                      )}
                    >
                      {language === 'ar' ? statusMeta.ar : statusMeta.en}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
