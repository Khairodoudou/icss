'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Receipt,
  Printer,
  ArrowRight,
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
    paymentType?: string
    referenceId?: string | null
  } | null
  service: { title: string; price?: number }
  serviceRequest?: { id: string; service: { title: string; price?: number } } | null
}

interface ApprovedRequest {
  id: string
  status: string
  service: { title: string; price?: number }
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

  // Receipt Modal State
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<BookingItem | null>(null)

  // Payment Checkout Modal State
  const [payingBooking, setPayingBooking] = useState<BookingItem | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'EDAHABIA' | 'CIB' | 'VIREMENT'>('EDAHABIA')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const reloadData = async () => {
    try {
      const [bookData, approvedData, allData] = await Promise.all([
        fetch('/api/bookings').then((r) => r.json()),
        fetch('/api/requests?status=APPROVED').then((r) => r.json()),
        fetch('/api/requests').then((r) => r.json()),
      ])

      if (bookData.success) setBookings(bookData.data)
      if (approvedData.success) {
        setApprovedRequests(approvedData.data)
      }
      if (allData.success) setAllRequestsCount(allData.data.length)
    } finally {
      setLoading(false)
    }
  }

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

  const handlePayForBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingBooking) return

    setIsProcessingPayment(true)
    try {
      const servicePrice = payingBooking.service.price || payingBooking.serviceRequest?.service.price || 0
      const serviceTitle = payingBooking.service.title || payingBooking.serviceRequest?.service.title || 'Service'

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: servicePrice,
          paymentType: 'SERVICE',
          serviceRequestId: payingBooking.serviceRequestId || payingBooking.serviceId,
          referenceId: serviceTitle,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(
          language === 'ar'
            ? `تم تسديد مستحقات خدمة (${serviceTitle}) بنجاح!`
            : `Payment for (${serviceTitle}) completed successfully!`
        )
        setPayingBooking(null)
        await reloadData()
      } else {
        toast.error(data.error || 'Payment failed')
      }
    } catch {
      toast.error('Payment processing failed')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handlePrint = () => {
    window.print()
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

        <div className="flex items-center gap-3">
          {hasApprovedRequests ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'حجز موعد جديد' : 'New Booking'}</span>
            </button>
          ) : (
            <Link
              href="/dashboard/services"
              className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'طلب خدمة جديدة' : 'New Service Request'}</span>
            </Link>
          )}
        </div>
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

                      {/* Payment status badge for all bookings */}
                      {b.isPaid ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'ar' ? 'مسدد ✓' : 'Paid ✓'}</span>
                        </span>
                      ) : (b.status === 'CONFIRMED' || b.status === 'COMPLETED') ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-amber-600" />
                          <span>{language === 'ar' ? 'بانتظار التسديد' : 'Unpaid'}</span>
                        </span>
                      ) : null}
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

                {/* Footer payment / invoice CTA */}
                {b.isPaid ? (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'ar' ? 'جلسة مسددة بالكامل' : 'Confirmed & Paid'}</span>
                    </span>
                    <button
                      onClick={() => setSelectedInvoiceBooking(b)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-brand-blue hover:bg-brand-blue/5 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض الفاتورة' : 'View Receipt'}</span>
                    </button>
                  </div>
                ) : (b.status === 'CONFIRMED' || b.status === 'COMPLETED') ? (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-800 font-medium">
                      {language === 'ar' ? 'يرجى تسديد المستحقات' : 'Payment required'}
                    </span>
                    <button
                      onClick={() => setPayingBooking(b)}
                      className="btn-primary text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>{language === 'ar' ? 'ادفع الآن' : 'Pay Now'}</span>
                    </button>
                  </div>
                ) : null}
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

      {/* ── Quick Checkout Modal (Pay for booking) ── */}
      {payingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-start">
            <button
              onClick={() => setPayingBooking(null)}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'تسديد مستحقات الجلسة' : 'Pay for Coaching Session'}
            </h3>
            <p className="text-xs text-brand-slate mb-6">
              {language === 'ar'
                ? `خدمة: ${payingBooking.service.title}`
                : `Service: ${payingBooking.service.title}`}
            </p>

            <form onSubmit={handlePayForBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'وسيلة الدفع' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EDAHABIA', 'CIB', 'VIREMENT'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={cn(
                        'py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                        paymentMethod === m
                          ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                          : 'border-gray-200 text-brand-slate hover:bg-gray-50'
                      )}
                    >
                      {m === 'EDAHABIA' ? 'الذهبية' : m === 'CIB' ? 'بطاقة CIB' : 'تحويل بنكي'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              {(() => {
                const price = payingBooking.service.price || payingBooking.serviceRequest?.service.price || 0
                return (
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 text-xs text-brand-slate">
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'تكلفة الخدمة:' : 'Service Cost:'}</span>
                      <span className="font-bold text-brand-navy" dir="ltr">
                        {price.toLocaleString()} DA
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>{language === 'ar' ? 'رسوم المعالجة:' : 'Processing fee:'}</span>
                      <span>{language === 'ar' ? 'مجانية 0 دج' : '0 DA (Included)'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-brand-navy text-sm">
                      <span>{language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                      <span dir="ltr">{price.toLocaleString()} DA</span>
                    </div>
                  </div>
                )
              })()}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPayingBooking(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="flex-1 btn-primary text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Official Printable Invoice Modal ── */}
      {selectedInvoiceBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 relative text-start overflow-hidden">
            <button
              onClick={() => setSelectedInvoiceBooking(null)}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Area */}
            <div id="printable-receipt" className="space-y-6">
              {/* Receipt Header (Centered) */}
              <div className="border-b border-gray-200 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-brand-slate uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">
                    {language === 'ar' ? 'وصل دفع رسمي' : 'Official Receipt'}
                  </span>
                  <span className="text-xs font-mono font-bold text-brand-blue" dir="ltr">
                    {selectedInvoiceBooking.payment?.transactionRef || `ICSS-${selectedInvoiceBooking.id.slice(0, 8)}`}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center text-center pt-1">
                  <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-xs border border-gray-100 flex items-center justify-center mb-2">
                    <Image
                      src="/logo.jpg"
                      alt="ICSS Logo"
                      width={48}
                      height={48}
                      className="object-contain rounded-xl"
                    />
                  </div>
                  <div className="text-xl font-black text-brand-navy tracking-tight">
                    ICSS
                  </div>
                  <p className="text-xs text-brand-slate mt-0.5">
                    International Center for Strategic Studies
                  </p>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-brand-slate text-[11px] block">
                    {language === 'ar' ? 'تاريخ المعاملة:' : 'Date:'}
                  </span>
                  <span className="font-bold text-brand-navy" dir="ltr">
                    {selectedInvoiceBooking.payment?.createdAt
                      ? new Date(selectedInvoiceBooking.payment.createdAt).toLocaleDateString()
                      : selectedInvoiceBooking.date}
                  </span>
                </div>

                <div>
                  <span className="text-brand-slate text-[11px] block">
                    {language === 'ar' ? 'نوع المعاملة:' : 'Type:'}
                  </span>
                  <span className="font-bold text-brand-navy">
                    {language === 'ar' ? 'جلسة مرافقة وتدريب' : 'Coaching Session'}
                  </span>
                </div>

                <div>
                  <span className="text-brand-slate text-[11px] block">
                    {language === 'ar' ? 'الحالة:' : 'Status:'}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {language === 'ar' ? 'مسددة بنجاح ✓' : 'PAID ✓'}
                  </span>
                </div>
              </div>

              {/* Item details */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-gray-200 font-bold text-brand-navy">
                  <span>{language === 'ar' ? 'بيان المعاملة / الخدمة' : 'Description'}</span>
                  <span>{language === 'ar' ? 'المبلغ' : 'Amount'}</span>
                </div>
                <div className="pt-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-brand-navy block">
                      {selectedInvoiceBooking.service.title}
                    </span>
                    <span className="text-[11px] text-brand-slate">
                      {language === 'ar'
                        ? `موعد الجلسة: ${selectedInvoiceBooking.date} على الساعة ${selectedInvoiceBooking.time}`
                        : `Session Scheduled: ${selectedInvoiceBooking.date} at ${selectedInvoiceBooking.time}`}
                    </span>
                  </div>
                  <span className="font-black text-brand-navy font-mono" dir="ltr">
                    {(selectedInvoiceBooking.payment?.amount || selectedInvoiceBooking.service.price || 0).toLocaleString()} DA
                  </span>
                </div>
              </div>

              {/* Total & Security Stamp */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-brand-teal font-semibold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>{language === 'ar' ? 'معاملة رقمية مؤمنة ومشفرة' : 'Verified Secure Transaction'}</span>
                </div>

                <div className="text-end">
                  <span className="text-xs text-brand-slate block">
                    {language === 'ar' ? 'المجموع النهائي المسدد:' : 'Total Amount Paid:'}
                  </span>
                  <span className="text-2xl font-black text-brand-navy font-mono" dir="ltr">
                    {(selectedInvoiceBooking.payment?.amount || selectedInvoiceBooking.service.price || 0).toLocaleString()} DA
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedInvoiceBooking(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'ar' ? 'طباعة الفاتورة' : 'Print Invoice'}</span>
              </button>
            </div>
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
