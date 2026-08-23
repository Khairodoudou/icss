'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarCheck2,
  Clock,
  Plus,
  X,
  Loader2,
  Calendar as CalendarIcon,
  FileText,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BookingItem {
  id: string
  serviceId: string
  serviceRequestId?: string | null
  date: string
  time: string
  status: string
  notes?: string | null
  createdAt: string
  isPaid?: boolean
  payment?: {
    id: string
    amount: number
    transactionRef: string
    createdAt: string
  } | null
  service: { title: string; price?: number }
  serviceRequest?: { id: string; service: { title: string; price?: number } } | null
}

interface ApprovedRequest {
  id: string
  status: string
  service: { title: string }
}

// ── Inner component that reads search params ──────────────────────────────────
function BookingsPageInner() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()

  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [approvedRequests, setApprovedRequests] = useState<ApprovedRequest[]>([])
  const [allRequestsCount, setAllRequestsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [serviceRequestId, setServiceRequestId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const preselect = searchParams.get('requestId')

    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/requests?status=APPROVED').then((r) => r.json()),
      fetch('/api/requests').then((r) => r.json()),
    ])
      .then(([bookData, approvedData, allData]) => {
        if (bookData.success) setBookings(bookData.data)
        if (approvedData.success) {
          setApprovedRequests(approvedData.data)
          // Pre-select from URL param or first available
          if (approvedData.data.length > 0) {
            const target = preselect
              ? approvedData.data.find((r: ApprovedRequest) => r.id === preselect)
              : null
            setServiceRequestId(target ? target.id : approvedData.data[0].id)
          }
        }
        if (allData.success) setAllRequestsCount(allData.data.length)
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  // Auto-open modal if coming from a "Book a Session" link
  useEffect(() => {
    const preselect = searchParams.get('requestId')
    if (preselect && approvedRequests.some((r) => r.id === preselect) && !loading) {
      setIsModalOpen(true)
    }
  }, [loading, approvedRequests, searchParams])

  const STATUS_META: Record<string, { en: string; ar: string; class: string }> = {
    PENDING: { en: 'Pending', ar: 'قيد التأكيد', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    CONFIRMED: { en: 'Confirmed', ar: 'مؤكد', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    COMPLETED: { en: 'Completed', ar: 'مكتمل', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    CANCELLED: { en: 'Cancelled', ar: 'ملغى', class: 'bg-gray-50 text-gray-700 border-gray-200' },
  }

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesStatus

      const matchesSearch =
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

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceRequestId || !date || !time) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceRequestId, date, time, notes }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(language === 'ar' ? 'تم تأكيد طلب الحجز بنجاح!' : 'Booking created successfully!')
        setBookings([data.data, ...bookings])
        setIsModalOpen(false)
        setNotes('')
        setDate('')
        setTime('10:00')
      } else {
        toast.error(data.error || 'Failed to book session')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  const hasApprovedRequests = approvedRequests.length > 0
  const hasAnyRequests = (allRequestsCount ?? 0) > 0

  return (
    <div className="space-y-8 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {language === 'ar' ? 'حجوزات الجلسات' : 'My Session Bookings'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'احجز موعداً مع خبرائنا لجلسات المرافقة والتدريب.'
              : 'Schedule and manage 1-on-1 sessions and workshops with our expert team.'}
          </p>
        </div>

        {hasApprovedRequests ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'حجز موعد جديد' : 'New Booking'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-brand-slate bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {language === 'ar'
                ? 'لا توجد خدمات موافق عليها للحجز'
                : 'No approved services to book'}
            </span>
          </div>
        )}
      </div>

      {/* ── Search & Filter Controls (When user has bookings) ── */}
      {bookings.length > 0 && (
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
                    ? 'بحث في حجوزاتي، الخدمة، التاريخ، أو الملاحظات...'
                    : 'Search by service title, date, notes...'
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
      )}

      {/* ── Empty States ──────────────────────────────────────────────────── */}
      {bookings.length === 0 && (
        <>
          {/* Case A: User has never submitted any request */}
          {!hasAnyRequests && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-1">
                {language === 'ar'
                  ? 'لم تقم بإرسال أي طلب خدمة بعد'
                  : 'No service requests submitted yet'}
              </h3>
              <p className="text-xs text-brand-slate mb-6">
                {language === 'ar'
                  ? 'ابدأ بتصفح الخدمات المتاحة وأرسل طلبك الأول. بعد الموافقة عليه، ستتمكن من حجز موعد.'
                  : 'Start by browsing available services and submitting a request. Once approved, you can book a session.'}
              </p>
              <Link
                href="/dashboard/services"
                className="btn-primary text-xs py-2.5 px-5 cursor-pointer"
              >
                {language === 'ar' ? 'استكشاف الخدمات' : 'Explore Services'}
              </Link>
            </div>
          )}

          {/* Case B: User has requests but none approved yet */}
          {hasAnyRequests && !hasApprovedRequests && (
            <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-1">
                {language === 'ar'
                  ? 'لا يمكنك الحجز حالياً'
                  : 'Booking not available yet'}
              </h3>
              <p className="text-xs text-brand-slate mb-6">
                {language === 'ar'
                  ? 'يجب انتظار موافقة الإدارة على طلب الخدمة أولاً قبل أن تتمكن من حجز موعد.'
                  : 'You must wait for administration to approve your service request before you can book a session.'}
              </p>
              <Link
                href="/dashboard/requests"
                className="btn-primary text-xs py-2.5 px-5 cursor-pointer"
              >
                {language === 'ar' ? 'عرض طلباتي' : 'View My Requests'}
              </Link>
            </div>
          )}

          {/* Case C: Has approved requests but no bookings yet */}
          {hasApprovedRequests && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto mb-4">
                <CalendarCheck2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-1">
                {language === 'ar' ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
              </h3>
              <p className="text-xs text-brand-slate mb-6">
                {language === 'ar'
                  ? 'طلبك تمت الموافقة عليه! اختر الوقت المناسب واحجز جلستك الأولى الآن.'
                  : 'Your request is approved! Choose a convenient date and time and book your first session now.'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary text-xs py-2.5 px-5 cursor-pointer"
              >
                {language === 'ar' ? 'حجز جلسة' : 'Book a Session'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Bookings List ──────────────────────────────────────────────────── */}
      {bookings.length > 0 && filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-brand-navy mb-1">
            {language === 'ar' ? 'لا توجد حجوزات مطابقة' : 'No matching bookings found'}
          </h3>
          <p className="text-xs text-brand-slate mb-4">
            {language === 'ar'
              ? 'جرب تغيير كلمة البحث أو اختيار فلتر آخر.'
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
      ) : bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBookings.map((b) => {
            const status = STATUS_META[b.status] || {
              en: b.status,
              ar: b.status,
              class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            }

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border',
                          status.class
                        )}
                      >
                        {language === 'ar' ? status.ar : status.en}
                      </span>

                      {/* Payment status badge for CONFIRMED bookings */}
                      {b.status === 'CONFIRMED' && !b.isPaid && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-amber-600" />
                          <span>{language === 'ar' ? 'بانتظار التسديد' : 'Unpaid'}</span>
                        </span>
                      )}

                      {b.status === 'CONFIRMED' && b.isPaid && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'ar' ? 'مسدد ✓' : 'Paid ✓'}</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-brand-slate" dir="ltr">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-navy mb-1">{b.service.title}</h3>

                  {/* Linked request badge */}
                  {b.serviceRequest && (
                    <p className="text-[11px] text-brand-slate mb-3">
                      {language === 'ar' ? 'من طلب:' : 'From request:'}{' '}
                      <span className="font-semibold text-brand-blue">
                        {b.serviceRequest.service.title}
                      </span>
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-semibold text-brand-blue mb-4">
                    <span className="flex items-center gap-1.5" dir="ltr">
                      <CalendarIcon className="w-4 h-4 text-brand-blue" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1.5" dir="ltr">
                      <Clock className="w-4 h-4 text-brand-blue" />
                      {b.time}
                    </span>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-brand-slate bg-gray-50 p-3 rounded-xl mb-3">{b.notes}</p>
                  )}
                </div>

                {/* Footer payment CTA for confirmed sessions */}
                {b.status === 'CONFIRMED' && !b.isPaid && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-800 font-medium">
                      {language === 'ar' ? 'يرجى تسديد الرسوم لتأكيد الحضور' : 'Payment required to confirm'}
                    </span>
                    <Link
                      href="/dashboard/payments"
                      className="btn-primary text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>{language === 'ar' ? 'ادفع الآن' : 'Pay Now'}</span>
                    </Link>
                  </div>
                )}

                {b.status === 'CONFIRMED' && b.isPaid && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تم تأكيد الحضور والتسديد' : 'Confirmed & Paid'}</span>
                    </span>
                    <Link
                      href="/dashboard/payments"
                      className="text-xs font-bold text-brand-blue hover:underline"
                    >
                      {language === 'ar' ? 'عرض الفاتورة' : 'View Receipt'}
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Booking Modal ──────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-start">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'حجز جلسة جديدة' : 'Book a New Session'}
            </h3>
            <p className="text-xs text-brand-slate mb-6">
              {language === 'ar'
                ? 'اختر الطلب الموافق عليه وحدد الوقت المناسب لك'
                : 'Select an approved request and pick your preferred date and time'}
            </p>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              {/* Approved Request selector */}
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'الطلب الموافق عليه' : 'Approved Service Request'}
                </label>
                {approvedRequests.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                    {language === 'ar'
                      ? 'لا توجد طلبات موافق عليها بعد.'
                      : 'No approved requests available.'}
                  </div>
                ) : (
                  <select
                    value={serviceRequestId}
                    onChange={(e) => setServiceRequestId(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
                  >
                    {approvedRequests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.service.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1.5">
                    {language === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1.5">
                    {language === 'ar' ? 'الساعة' : 'Time'}
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Notes / Agenda (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'التركيز على مراجعة ملف المستثمرين...'
                      : 'Focus on investor Q&A practice...'
                  }
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !serviceRequestId}
                  className="flex-1 btn-primary text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Wrapper with Suspense (required for useSearchParams) ─────────────────────
export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    }>
      <BookingsPageInner />
    </Suspense>
  )
}
