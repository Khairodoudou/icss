'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  CalendarCheck2,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  Check,
  X,
  CheckCircle2,
  FileText,
  Search,
  Filter,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BookingItem {
  id: string
  date: string
  time: string
  status: string
  notes?: string | null
  createdAt: string
  isPaid?: boolean
  service: { title: string }
  user: { name: string; email: string; phone?: string | null }
  serviceRequest?: { id: string; service: { title: string } } | null
}

export default function AdminBookingsPage() {
  const { language } = useLanguage()
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) setBookings(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        const labels: Record<string, { ar: string; en: string }> = {
          CONFIRMED: { ar: 'مؤكد', en: 'CONFIRMED' },
          COMPLETED: { ar: 'مكتمل', en: 'COMPLETED' },
          CANCELLED: { ar: 'ملغى', en: 'CANCELLED' },
        }
        toast.success(
          language === 'ar'
            ? `تم تحديث حالة الحجز إلى ${labels[status]?.ar || status}`
            : `Booking marked as ${labels[status]?.en || status}`
        )
        fetchBookings()
      } else {
        toast.error(data.error || 'Failed to update booking')
      }
    } catch {
      toast.error('Failed to update booking')
    }
  }

  const STATUS_META: Record<string, { en: string; ar: string; class: string }> = {
    PENDING: { en: 'Pending', ar: 'قيد التأكيد', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    CONFIRMED: { en: 'Confirmed', ar: 'مؤكد', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    COMPLETED: { en: 'Completed', ar: 'مكتمل', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغى', class: 'bg-red-50 text-red-700 border-red-200' },
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesStatus

      const matchesSearch =
        b.user.name?.toLowerCase().includes(q) ||
        b.user.email?.toLowerCase().includes(q) ||
        b.service.title?.toLowerCase().includes(q) ||
        b.date?.toLowerCase().includes(q) ||
        b.time?.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q) ||
        b.serviceRequest?.service.title?.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [bookings, statusFilter, searchQuery])

  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: bookings.length }
    for (const key of Object.keys(STATUS_META)) {
      res[key] = bookings.filter((b) => b.status === key).length
    }
    return res
  }, [bookings])

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-8 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {language === 'ar' ? 'إدارة المواعيد والجلسات' : 'Sessions & Bookings Schedule'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'متابعة وتأكيد جلسات المرافقة الفردية والورشات مع رواد الأعمال.'
              : 'Schedule, confirm, and coordinate coaching sessions and workshops.'}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-brand-slate absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'بحث بالعميل، الخدمة، التاريخ، أو الملاحظات...'
                  : 'Search by client, service, date, notes...'
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl ps-9 pe-9 py-2.5 text-xs text-brand-navy placeholder:text-gray-400 focus:bg-white focus:border-brand-blue focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-xs text-brand-slate shrink-0">
            {language === 'ar'
              ? `عرض ${filteredBookings.length} من أصل ${bookings.length} حجز`
              : `Showing ${filteredBookings.length} of ${bookings.length} bookings`}
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
              statusFilter === 'ALL'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'bg-gray-100 text-brand-slate hover:bg-gray-200'
            )}
          >
            <span>{language === 'ar' ? 'الكل' : 'All'}</span>
            <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', statusFilter === 'ALL' ? 'bg-white/20' : 'bg-gray-200 text-brand-slate')}>
              {counts.ALL || 0}
            </span>
          </button>

          {Object.entries(STATUS_META).map(([key, meta]) => {
            const isActive = statusFilter === key
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border',
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                    : 'bg-white text-brand-slate border-gray-200 hover:bg-gray-50'
                )}
              >
                <span>{language === 'ar' ? meta.ar : meta.en}</span>
                <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', isActive ? 'bg-white/20' : 'bg-gray-100 text-brand-slate')}>
                  {counts[key] || 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bookings Table / Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-brand-navy mb-1">
            {language === 'ar' ? 'لا توجد حجوزات مطابقة' : 'No matching bookings found'}
          </h3>
          <p className="text-xs text-brand-slate mb-4">
            {language === 'ar'
              ? 'جرب تعديل كلمة البحث أو إعادة تعيين الفلاتر.'
              : 'Try adjusting your search query or reset status filter.'}
          </p>
          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
              }}
              className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50/80 text-brand-slate uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">{language === 'ar' ? 'العميل' : 'Client'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'الخدمة' : 'Service'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'الطلب المرتبط' : 'Related Request'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'ملاحظات' : 'Notes'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => {
                  const status = STATUS_META[b.status] || {
                    en: b.status,
                    ar: b.status,
                    class: 'bg-gray-50 text-gray-700 border-gray-200',
                  }

                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-navy">{b.user.name}</div>
                        <div className="text-[11px] text-brand-slate">{b.user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-brand-blue">{b.service.title}</td>
                      <td className="px-6 py-4">
                        {b.serviceRequest ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                            <FileText className="w-3 h-3" />
                            {b.serviceRequest.service.title}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-brand-navy flex items-center gap-1.5" dir="ltr">
                          <CalendarIcon className="w-3.5 h-3.5 text-brand-slate" />
                          {b.date}
                        </div>
                        <div className="text-[11px] text-brand-slate flex items-center gap-1.5 mt-0.5" dir="ltr">
                          <Clock className="w-3 h-3 text-brand-slate" />
                          {b.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-brand-slate max-w-xs truncate">
                        {b.notes || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2.5 py-1 rounded-full border',
                              status.class
                            )}
                          >
                            {language === 'ar' ? status.ar : status.en}
                          </span>
                          {b.isPaid ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {language === 'ar' ? 'مسدد ✓' : 'PAID ✓'}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              {language === 'ar' ? 'غير مسدد' : 'UNPAID'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {/* From PENDING -> can CONFIRM or CANCEL */}
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition-colors cursor-pointer"
                                title={language === 'ar' ? 'تأكيد الحجز' : 'Confirm session'}
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{language === 'ar' ? 'تأكيد' : 'Confirm'}</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                                className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                                title={language === 'ar' ? 'إلغاء الحجز' : 'Cancel session'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* From CONFIRMED -> can COMPLETE or CANCEL */}
                          {b.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-[11px] transition-colors cursor-pointer"
                                title={language === 'ar' ? 'إكمال الجلسة' : 'Mark as Completed'}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{language === 'ar' ? 'إكمال' : 'Complete'}</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                                className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                                title={language === 'ar' ? 'إلغاء الحجز' : 'Cancel session'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Final states */}
                          {(b.status === 'COMPLETED' || b.status === 'CANCELLED') && (
                            <span className="text-gray-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

