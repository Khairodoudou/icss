'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  MessageSquareQuote,
  Loader2,
  CalendarCheck2,
  CreditCard,
  ShieldCheck,
  X,
  Receipt,
  Search,
  Filter,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RequestItem {
  id: string
  serviceId: string
  message: string
  status: string
  adminNote?: string | null
  createdAt: string
  isPaid?: boolean
  payment?: {
    id: string
    amount: number
    transactionRef: string
    createdAt: string
  } | null
  service: {
    title: string
    price: number
    duration: string
  }
  bookings?: {
    id: string
    status: string
    date: string
    time: string
  }[]
}

export default function RequestsPage() {
  const { language } = useLanguage()
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Payment checkout modal state
  const [payingRequest, setPayingRequest] = useState<RequestItem | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'EDAHABIA' | 'CIB' | 'VIREMENT'>('EDAHABIA')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests')
      const data = await res.json()
      if (data.success) setRequests(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const STATUS_META: Record<string, { en: string; ar: string; class: string }> = {
    PENDING: { en: 'Pending Review', ar: 'قيد المعالجة', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { en: 'Approved', ar: 'مقبول ✓', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    IN_PROGRESS: { en: 'In Progress', ar: 'قيد الإنجاز', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    COMPLETED: { en: 'Completed', ar: 'مكتمل', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { en: 'Rejected', ar: 'مرفوض', class: 'bg-red-50 text-red-700 border-red-200' },
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesStatus

      const matchesSearch =
        req.service?.title?.toLowerCase().includes(q) ||
        req.message?.toLowerCase().includes(q) ||
        req.adminNote?.toLowerCase().includes(q) ||
        req.id?.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [requests, statusFilter, searchQuery])

  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: requests.length }
    for (const key of Object.keys(STATUS_META)) {
      res[key] = requests.filter((r) => r.status === key).length
    }
    return res
  }, [requests])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingRequest) return

    setIsProcessingPayment(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payingRequest.service.price,
          paymentType: 'SERVICE',
          serviceRequestId: payingRequest.id,
          referenceId: payingRequest.service.title,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(
          language === 'ar'
            ? `تم تسديد مستحقات خدمة (${payingRequest.service.title}) بنجاح!`
            : `Payment for (${payingRequest.service.title}) completed successfully!`
        )
        setPayingRequest(null)
        await fetchRequests()
      } else {
        toast.error(data.error || 'Payment failed')
      }
    } catch {
      toast.error('Payment processing failed')
    } finally {
      setIsProcessingPayment(false)
    }
  }

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
            {language === 'ar' ? 'طلبات الخدمات' : 'My Service Requests'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'تابع حالة طلباتك والملاحظات المستلمة من فريق الإدارة وحالة التسديد.'
              : 'Track the status, admin notes, session confirmations and payment status.'}
          </p>
        </div>

        <Link
          href="/dashboard/services"
          className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'طلب جديد' : 'New Request'}</span>
        </Link>
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
                  ? 'بحث في طلباتي، عنوان الخدمة، أو الملاحظات...'
                  : 'Search by service title, message, notes...'
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
              ? `عرض ${filteredRequests.length} من أصل ${requests.length} طلب`
              : `Showing ${filteredRequests.length} of ${requests.length} requests`}
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

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-brand-navy mb-1">
            {language === 'ar' ? 'لا توجد طلبات مطابقة' : 'No matching requests found'}
          </h3>
          <p className="text-xs text-brand-slate mb-4">
            {language === 'ar'
              ? 'جرب تغيير كلمة البحث أو إعادة تعيين الفلاتر.'
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
        <div className="space-y-4">
          {filteredRequests.map((item) => {
            const status = STATUS_META[item.status] || {
              en: item.status,
              ar: item.status,
              class: 'bg-gray-50 text-gray-700 border-gray-200',
            }
            const isApproved = item.status === 'APPROVED'

            // Check if there is a confirmed booking for this request
            const confirmedBooking = item.bookings?.find((b) => b.status === 'CONFIRMED')
            const isBookingConfirmed = !!confirmedBooking
            const isPaid = !!item.isPaid

            return (
              <div
                key={item.id}
                className={cn(
                  'bg-white rounded-2xl p-6 border shadow-xs hover:shadow-md transition-all duration-200 text-start',
                  isApproved ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-100'
                )}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-brand-navy">{item.service.title}</h3>
                    <span className="text-xs text-brand-slate" dir="ltr">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        'text-xs font-bold px-3 py-1 rounded-full border',
                        status.class
                      )}
                    >
                      {language === 'ar' ? status.ar : status.en}
                    </span>

                    {/* ── Case 1: Approved, No confirmed booking yet -> Show [Book a Session] ── */}
                    {isApproved && !isBookingConfirmed && (
                      <Link
                        href={`/dashboard/bookings?requestId=${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-blue text-white px-3 py-1.5 rounded-full hover:bg-brand-navy transition-colors cursor-pointer shadow-sm"
                      >
                        <CalendarCheck2 className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'احجز جلسة' : 'Book a Session'}
                      </Link>
                    )}

                    {/* ── Case 2: Confirmed booking, but UNPAID -> Show Unpaid badge ── */}
                    {isApproved && isBookingConfirmed && !isPaid && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'ar' ? 'في انتظار التسديد' : 'Payment Pending'}</span>
                      </span>
                    )}

                    {/* ── Case 3: Confirmed booking AND PAID -> Show Paid badge ── */}
                    {isApproved && isBookingConfirmed && isPaid && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === 'ar' ? 'مسدد بالكامل ✓' : 'PAID ✓'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Banner 1: APPROVED without booking yet ── */}
                {isApproved && !isBookingConfirmed && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-3 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 shrink-0" />
                    {language === 'ar'
                      ? 'تمت الموافقة على طلبك! يمكنك الآن حجز موعد جلستك.'
                      : 'Your request has been approved! You can now book your session.'}
                  </div>
                )}

                {/* ── Banner 2: Confirmed booking BUT NOT PAID YET ➔ Show Payment CTA ── */}
                {isApproved && isBookingConfirmed && !isPaid && (
                  <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 mb-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-amber-950 mb-0.5">
                        <CalendarCheck2 className="w-4 h-4 text-amber-700" />
                        <span>
                          {language === 'ar'
                            ? `تم تثبيت الموعد بتاريخ ${confirmedBooking.date} على الساعة ${confirmedBooking.time}`
                            : `Session booked for ${confirmedBooking.date} at ${confirmedBooking.time}`}
                        </span>
                      </div>
                      <p className="text-amber-800 text-[11px]">
                        {language === 'ar'
                          ? `يرجى تسديد المستحقات (${item.service.price.toLocaleString()} دج) لتأكيد الحضور النهائي مع المدرب.`
                          : `Please complete payment (${item.service.price.toLocaleString()} DA) to finalize attendance confirmation.`}
                      </p>
                    </div>

                    <button
                      onClick={() => setPayingRequest(item)}
                      className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {language === 'ar'
                          ? `تسديد المستحقات (${item.service.price.toLocaleString()} دج)`
                          : `Pay (${item.service.price.toLocaleString()} DA)`}
                      </span>
                    </button>
                  </div>
                )}

                {/* ── Banner 3: Confirmed booking AND FULLY PAID ➔ Show Verified Banner ── */}
                {isApproved && isBookingConfirmed && isPaid && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 mb-4 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block text-emerald-950">
                          {language === 'ar'
                            ? 'تم تسديد المستحقات بالكامل وتثبيت الجلسة بنجاح ✓'
                            : 'Fees fully paid & coaching session verified ✓'}
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          {language === 'ar'
                            ? `الموعد: ${confirmedBooking.date} | الساعة: ${confirmedBooking.time}`
                            : `Date: ${confirmedBooking.date} | Time: ${confirmedBooking.time}`}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/payments"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-colors shrink-0"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض الفاتورة' : 'View Invoice'}</span>
                    </Link>
                  </div>
                )}

                {/* User Message */}
                <div className="bg-gray-50/70 p-4 rounded-xl text-xs text-brand-slate leading-relaxed mb-3">
                  <span className="font-bold text-brand-navy block mb-1">
                    {language === 'ar' ? 'رسالتك:' : 'Your message:'}
                  </span>
                  {item.message}
                </div>

                {/* Admin Note if available */}
                {item.adminNote && (
                  <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl text-xs text-brand-blue flex items-start gap-2.5">
                    <MessageSquareQuote className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">
                        {language === 'ar' ? 'ملاحظة الإدارة:' : 'Admin Note:'}
                      </span>
                      {item.adminNote}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Quick Checkout Modal ── */}
      {payingRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-start">
            <button
              onClick={() => setPayingRequest(null)}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'تسديد مستحقات الجلسة' : 'Session Payment'}
            </h3>
            <p className="text-xs text-brand-slate mb-6">
              {language === 'ar'
                ? `خدمة: ${payingRequest.service.title}`
                : `Service: ${payingRequest.service.title}`}
            </p>

            <form onSubmit={handlePay} className="space-y-4">
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

              {/* Price Details */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 text-xs text-brand-slate">
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'المبلغ المستحق:' : 'Service Fee:'}</span>
                  <span className="font-bold text-brand-navy font-mono" dir="ltr">
                    {payingRequest.service.price.toLocaleString()} DA
                  </span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{language === 'ar' ? 'رسوم المعاملة:' : 'Processing:'}</span>
                  <span>{language === 'ar' ? 'مجانية (0 دج)' : '0 DA (Included)'}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-brand-navy text-sm">
                  <span>{language === 'ar' ? 'المجموع النهائي:' : 'Total Amount:'}</span>
                  <span className="font-mono text-brand-blue" dir="ltr">
                    {payingRequest.service.price.toLocaleString()} DA
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPayingRequest(null)}
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
                    <span>{language === 'ar' ? 'تأكيد السداد الآن' : 'Confirm Payment Now'}</span>
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


