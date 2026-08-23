'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CreditCard,
  Plus,
  Loader2,
  Receipt,
  FileText,
  Printer,
  X,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  Search,
  Filter,
} from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PaymentItem {
  id: string
  amount: number
  paymentType: string
  status: string
  referenceId?: string | null
  transactionRef: string
  createdAt: string
  transaction?: {
    grossAmount: number
    commissionRate: number
    commissionAmount: number
    netAmount: number
  } | null
}

interface ApprovedRequest {
  id: string
  serviceId: string
  message: string
  status: string
  service: {
    title: string
    price: number
    duration: string
  }
}

interface CurrentSubscription {
  id: string
  status: string
  plan: {
    name: string
    price: number
  }
}

export default function PaymentsPage() {
  const { language } = useLanguage()
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [approvedRequests, setApprovedRequests] = useState<ApprovedRequest[]>([])
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'SUBSCRIPTION' | 'SERVICE'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Invoice Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentItem | null>(null)

  // Payment Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CIB' | 'EDAHABIA' | 'VIREMENT'>('EDAHABIA')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    try {
      const [payRes, reqRes, subRes] = await Promise.all([
        fetch('/api/payments').then((r) => r.json()),
        fetch('/api/requests?status=APPROVED').then((r) => r.json()),
        fetch('/api/subscriptions').then((r) => r.json()),
      ])

      if (payRes.success) setPayments(payRes.data)
      if (reqRes.success) {
        setApprovedRequests(reqRes.data)
        if (reqRes.data.length > 0) setSelectedRequestId(reqRes.data[0].id)
      }
      if (subRes.success && subRes.data?.currentSubscription) {
        setCurrentSub(subRes.data.currentSubscription)
      }
    } catch {
      toast.error('Failed to load financial records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePayForService = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetReq = approvedRequests.find((r) => r.id === selectedRequestId)
    if (!targetReq) return

    setIsProcessing(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: targetReq.service.price,
          paymentType: 'SERVICE',
          serviceRequestId: targetReq.id,
          referenceId: targetReq.service.title,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(
          language === 'ar'
            ? `تم تسديد مستحقات خدمة (${targetReq.service.title}) بنجاح!`
            : `Payment for (${targetReq.service.title}) processed successfully!`
        )
        setIsCheckoutOpen(false)
        await fetchData()
      } else {
        toast.error(data.error || 'Payment failed')
      }
    } catch {
      toast.error('Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const TYPE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
    SERVICE: {
      en: 'Service Session',
      ar: 'خدمة مرافقة / استشارة',
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    PROGRAM: {
      en: 'Training Program',
      ar: 'برنامج تدريبي',
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    SUBSCRIPTION: {
      en: 'Subscription Plan',
      ar: 'خطة اشتراك دوري',
      color: 'bg-teal-50 text-teal-700 border-teal-100',
    },
  }

  const filteredPayments = payments.filter((p) => {
    const matchesFilter = activeFilter === 'ALL' || p.paymentType === activeFilter

    const q = searchQuery.toLowerCase().trim()
    if (!q) return matchesFilter

    const matchesSearch =
      p.transactionRef?.toLowerCase().includes(q) ||
      p.referenceId?.toLowerCase().includes(q) ||
      p.paymentType?.toLowerCase().includes(q) ||
      p.amount?.toString().includes(q) ||
      p.id?.toLowerCase().includes(q)

    return matchesFilter && matchesSearch
  })

  const totalSpent = payments.reduce((acc, p) => acc + p.amount, 0)

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
            {language === 'ar' ? 'سجل المدفوعات والفواتير' : 'Payments & Invoices'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'تتبع فواتيرك الصادرة، الاشتراكات والخدمات المسددة مع إمكانية طباعة الإيصالات الرسمية.'
              : 'Track official transaction invoices, paid services and subscriptions with instant printable receipts.'}
          </p>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Spent */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">
            {language === 'ar' ? 'إجمالي المدفوعات' : 'Total Spent'}
          </span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span dir="ltr" className="text-3xl font-black text-brand-navy font-mono">
              {totalSpent.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-brand-navy">
              {language === 'ar' ? 'دج' : 'DA'}
            </span>
          </div>
          <span className="text-xs text-brand-slate">
            {payments.length} {language === 'ar' ? 'معاملة مسجلة بالكامل' : 'completed transactions'}
          </span>
        </div>

        {/* Current Plan */}
        <div className="bg-white p-6 rounded-3xl border border-brand-blue/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider">
              {language === 'ar' ? 'الاشتراك الحالي' : 'Active Plan'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-brand-navy">
              {currentSub?.plan.name || (language === 'ar' ? 'خطة مجانية' : 'Free Plan')}
            </span>
          </div>
          <Link
            href="/dashboard/subscription"
            className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'ar' ? 'إدارة الاشتراك' : 'Manage Subscription'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Available Approved Services to Pay */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-brand-slate uppercase tracking-wider">
            {language === 'ar' ? 'خدمات جاهزة للسداد' : 'Services Ready for Payment'}
          </span>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-brand-navy font-mono">
              {approvedRequests.length}
            </span>
            <span className="text-sm font-bold text-brand-navy">
              {language === 'ar' ? 'خدمة معتمدة' : 'approved'}
            </span>
          </div>
          {approvedRequests.length > 0 ? (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="text-xs font-bold text-brand-blue hover:underline inline-flex items-center gap-1 cursor-pointer text-start"
            >
              <span>{language === 'ar' ? 'تسديد الآن ←' : 'Pay now →'}</span>
            </button>
          ) : (
            <span className="text-xs text-brand-slate">
              {language === 'ar' ? 'جميع الخدمات مسددة' : 'All approved services settled'}
            </span>
          )}
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      {payments.length > 0 && (
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
                    ? 'بحث برقم الإيصال، نوع الخدمة، أو المبلغ...'
                    : 'Search by receipt ref, service, amount...'
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
                ? `عرض ${filteredPayments.length} من أصل ${payments.length} معاملة`
                : `Showing ${filteredPayments.length} of ${payments.length} payments`}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={cn(
                'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
                activeFilter === 'ALL'
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-gray-100 text-brand-slate hover:bg-gray-200'
              )}
            >
              <span>{language === 'ar' ? 'جميع المعاملات' : 'All Transactions'}</span>
              <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', activeFilter === 'ALL' ? 'bg-white/20' : 'bg-gray-200 text-brand-slate')}>
                {payments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('SUBSCRIPTION')}
              className={cn(
                'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border',
                activeFilter === 'SUBSCRIPTION'
                  ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                  : 'bg-white text-brand-slate border-gray-200 hover:bg-gray-50'
              )}
            >
              <span>{language === 'ar' ? 'الاشتراكات' : 'Subscriptions'}</span>
              <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', activeFilter === 'SUBSCRIPTION' ? 'bg-white/20' : 'bg-gray-100 text-brand-slate')}>
                {payments.filter((p) => p.paymentType === 'SUBSCRIPTION').length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('SERVICE')}
              className={cn(
                'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border',
                activeFilter === 'SERVICE'
                  ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                  : 'bg-white text-brand-slate border-gray-200 hover:bg-gray-50'
              )}
            >
              <span>{language === 'ar' ? 'الخدمات' : 'Services'}</span>
              <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', activeFilter === 'SERVICE' ? 'bg-white/20' : 'bg-gray-100 text-brand-slate')}>
                {payments.filter((p) => p.paymentType === 'SERVICE').length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Payments Table / Empty State */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-brand-navy mb-1">
            {language === 'ar' ? 'لا توجد فواتير أو مدفوعات مسجلة' : 'No invoices or payments yet'}
          </h3>
          <p className="text-xs text-brand-slate mb-6">
            {language === 'ar'
              ? 'ستظهر هنا جميع فواتير الخدمات والاشتراكات فور تسديدها مع إمكانية استخراج الوصولات الرسمية.'
              : 'All your paid services and subscriptions will appear here with official receipts.'}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/dashboard/services" className="btn-primary text-xs py-2.5 px-4 cursor-pointer">
              {language === 'ar' ? 'طلب خدمة' : 'Request a Service'}
            </Link>
            <Link
              href="/dashboard/subscription"
              className="btn-secondary text-xs py-2.5 px-4 cursor-pointer"
            >
              {language === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
            </Link>
          </div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-brand-navy mb-1">
            {language === 'ar' ? 'لا توجد مدفوعات مطابقة' : 'No matching payments found'}
          </h3>
          <p className="text-xs text-brand-slate mb-4">
            {language === 'ar'
              ? 'جرب تعديل كلمة البحث أو إعادة تعيين الفلاتر.'
              : 'Try adjusting your search query or reset filter.'}
          </p>
          {(searchQuery || activeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('ALL')
              }}
              className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50/80 text-brand-slate uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">{language === 'ar' ? 'رقم الإيصال / المعاملة' : 'Receipt / Ref'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'نوع الدفع' : 'Type'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'المبلغ المسدد' : 'Amount Paid'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'الفاتورة' : 'Invoice'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => {
                  const type = TYPE_LABELS[p.paymentType] || {
                    en: p.paymentType,
                    ar: p.paymentType,
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                  }

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-brand-navy">
                          {p.transactionRef || p.id.slice(0, 12)}
                        </div>
                        {p.referenceId && (
                          <div className="text-[11px] text-brand-slate truncate max-w-xs">
                            {p.referenceId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2.5 py-1 rounded-full border',
                            type.color
                          )}
                        >
                          {language === 'ar' ? type.ar : type.en}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-brand-slate" dir="ltr">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-black text-brand-navy">
                        <span dir="ltr" className="font-mono text-sm">
                          {p.amount.toLocaleString()}
                        </span>{' '}
                        {language === 'ar' ? 'دج' : 'DA'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{language === 'ar' ? 'مسددة بنجاح' : 'PAID'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedInvoice(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-brand-blue hover:bg-brand-blue/5 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'عرض الفاتورة' : 'View Receipt'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Checkout Modal (Pay for approved service) ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-start">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'تسديد مستحقات خدمة' : 'Pay for Approved Service'}
            </h3>
            <p className="text-xs text-brand-slate mb-6">
              {language === 'ar'
                ? 'اختر الخدمة المعتمدة لإتمام الدفع الإلكتروني الآمن'
                : 'Select the approved request to complete your electronic payment'}
            </p>

            <form onSubmit={handlePayForService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'الخدمة المعتمدة' : 'Approved Service'}
                </label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
                >
                  {approvedRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.service.title} — {r.service.price.toLocaleString()}{' '}
                      {language === 'ar' ? 'دج' : 'DA'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
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
                const target = approvedRequests.find((r) => r.id === selectedRequestId)
                if (!target) return null
                return (
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5 text-xs text-brand-slate">
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'تكلفة الخدمة:' : 'Service Cost:'}</span>
                      <span className="font-bold text-brand-navy" dir="ltr">
                        {target.service.price.toLocaleString()} DA
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>{language === 'ar' ? 'رسوم المعالجة:' : 'Processing fee:'}</span>
                      <span>{language === 'ar' ? 'مجانية 0 دج' : '0 DA (Included)'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-brand-navy text-sm">
                      <span>{language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}</span>
                      <span dir="ltr">{target.service.price.toLocaleString()} DA</span>
                    </div>
                  </div>
                )
              })()}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedRequestId}
                  className="flex-1 btn-primary text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
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
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 relative text-start overflow-hidden">
            <button
              onClick={() => setSelectedInvoice(null)}
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
                    {selectedInvoice.transactionRef || selectedInvoice.id}
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
                    {language === 'ar' ? 'تاريخ الدفع:' : 'Date:'}
                  </span>
                  <span className="font-bold text-brand-navy" dir="ltr">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="text-brand-slate text-[11px] block">
                    {language === 'ar' ? 'نوع المعاملة:' : 'Type:'}
                  </span>
                  <span className="font-bold text-brand-navy">
                    {TYPE_LABELS[selectedInvoice.paymentType]?.[language === 'ar' ? 'ar' : 'en'] ||
                      selectedInvoice.paymentType}
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
                      {selectedInvoice.referenceId ||
                        (selectedInvoice.paymentType === 'SUBSCRIPTION'
                          ? 'Platform Subscription'
                          : 'Professional Coaching Session')}
                    </span>
                    <span className="text-[11px] text-brand-slate">
                      {language === 'ar' ? 'خدمة مرافقة وتدريب استراتيجي' : 'Strategic coaching and training service'}
                    </span>
                  </div>
                  <span className="font-black text-brand-navy font-mono" dir="ltr">
                    {selectedInvoice.amount.toLocaleString()} DA
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
                    {selectedInvoice.amount.toLocaleString()} DA
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
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

