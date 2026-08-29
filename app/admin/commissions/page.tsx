'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, Receipt, Search, X, Filter } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

interface PaymentWithTx {
  id: string
  amount: number
  paymentType: string
  status: string
  transactionRef: string
  createdAt: string
  user: { name: string; email: string }
  transaction?: {
    grossAmount: number
    commissionRate: number
    commissionAmount: number
    netAmount: number
  } | null
}

export default function AdminCommissionsPage() {
  const { language } = useLanguage()
  const [payments, setPayments] = useState<PaymentWithTx[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  useEffect(() => {
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPayments(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesType = typeFilter === 'ALL' || p.paymentType === typeFilter

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesType

      const matchesSearch =
        p.user?.name?.toLowerCase().includes(q) ||
        p.user?.email?.toLowerCase().includes(q) ||
        p.transactionRef?.toLowerCase().includes(q) ||
        p.paymentType?.toLowerCase().includes(q) ||
        p.amount?.toString().includes(q)

      return matchesType && matchesSearch
    })
  }, [payments, typeFilter, searchQuery])

  const counts = useMemo(() => {
    return {
      ALL: payments.length,
      SERVICE: payments.filter((p) => p.paymentType === 'SERVICE').length,
      SUBSCRIPTION: payments.filter((p) => p.paymentType === 'SUBSCRIPTION').length,
      PROGRAM: payments.filter((p) => p.paymentType === 'PROGRAM').length,
    }
  }, [payments])

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  const totalGross = payments.reduce((acc, p) => acc + p.amount, 0)
  const totalCommission = payments.reduce((acc, p) => {
    const isSub = p.paymentType === 'SUBSCRIPTION'
    if (isSub) return acc + 0
    return acc + (p.transaction ? p.transaction.commissionAmount : (p.amount * 10) / 100)
  }, 0)
  const totalNet = payments.reduce((acc, p) => {
    const isSub = p.paymentType === 'SUBSCRIPTION'
    if (isSub) return acc + p.amount
    return acc + (p.transaction ? p.transaction.netAmount : p.amount - (p.amount * 10) / 100)
  }, 0)

  return (
    <div className="space-y-8 text-start">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          {language === 'ar' ? 'العمولات والمعاملات المالية' : 'Commissions & Financial Ledger'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate mt-1">
          {language === 'ar'
            ? 'تتبع نسب العمولات (10% للخدمات و 0% للاشتراكات)، المبالغ الإجمالية وصافي إيرادات المنصة.'
            : 'Detailed tracking of platform commission rates (10% for services, 0% for direct subscriptions), gross sales, and net distributions.'}
        </p>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-brand-slate uppercase">
            {language === 'ar' ? 'إجمالي المبيعات' : 'Total Gross Sales'}
          </span>
          <div className="flex items-baseline gap-1 text-3xl font-black text-brand-navy mt-2">
            <span dir="ltr" className="font-mono">{totalGross.toLocaleString()}</span>
            <span className="text-sm">{language === 'ar' ? 'دج' : 'DA'}</span>
          </div>
          <span className="text-[11px] text-brand-slate mt-1 block">
            {language === 'ar' ? 'مجموع مدفوعات العملاء' : 'Total client payments'}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-coral/20 shadow-xs">
          <span className="text-xs font-bold text-brand-coral uppercase">
            {language === 'ar' ? 'عمولة المنصة' : 'Platform Commission'}
          </span>
          <div className="flex items-baseline gap-1 text-3xl font-black text-brand-coral mt-2">
            <span dir="ltr" className="font-mono">{totalCommission.toLocaleString()}</span>
            <span className="text-sm">{language === 'ar' ? 'دج' : 'DA'}</span>
          </div>
          <span className="text-[11px] text-brand-slate mt-1 block">
            {language === 'ar' ? 'النسبة المقتطعة من الخدمات (10%)' : '10% retained fee on services'}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-teal/20 shadow-xs">
          <span className="text-xs font-bold text-brand-teal uppercase">
            {language === 'ar' ? 'صافي المبالغ المستحقة' : 'Net Revenue'}
          </span>
          <div className="flex items-baseline gap-1 text-3xl font-black text-brand-teal mt-2">
            <span dir="ltr" className="font-mono">{totalNet.toLocaleString()}</span>
            <span className="text-sm">{language === 'ar' ? 'دج' : 'DA'}</span>
          </div>
          <span className="text-[11px] text-brand-slate mt-1 block">
            {language === 'ar' ? 'الصافي بعد خصم العمولات' : 'Net revenue after commission'}
          </span>
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
                  ? 'بحث بالمرجع، العميل، أو البريد...'
                  : 'Search by reference, client, email...'
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
              : `Showing ${filteredPayments.length} of ${payments.length} transactions`}
          </div>
        </div>

        {/* Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', ar: 'جميع المعاملات', en: 'All Types' },
            { id: 'SERVICE', ar: 'خدمات', en: 'Services' },
            { id: 'SUBSCRIPTION', ar: 'اشتراكات', en: 'Subscriptions' },
            { id: 'PROGRAM', ar: 'برامج تدريبية', en: 'Programs' },
          ].map((tab) => {
            const isActive = typeFilter === tab.id
            const count = counts[tab.id as keyof typeof counts] || 0
            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border',
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                    : 'bg-white text-brand-slate border-gray-200 hover:bg-gray-50'
                )}
              >
                <span>{language === 'ar' ? tab.ar : tab.en}</span>
                <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', isActive ? 'bg-white/20' : 'bg-gray-100 text-brand-slate')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'لا توجد معاملات مطابقة' : 'No Matching Transactions'}
            </h3>
            <p className="text-xs text-brand-slate max-w-sm mx-auto mb-4">
              {language === 'ar'
                ? 'جرب تغيير كلمة البحث أو إعادة تعيين الفلاتر.'
                : 'Try adjusting your search query or reset transaction type filter.'}
            </p>
            {(searchQuery || typeFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setTypeFilter('ALL')
                }}
                className="bg-brand-blue text-white text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-gray-50/80 text-brand-slate uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">{language === 'ar' ? 'المرجع' : 'Tx Ref'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'العميل' : 'Client'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'نوع المعاملة' : 'Type'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'المبلغ الإجمالي' : 'Gross Amount'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'النسبة' : 'Rate'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'العمولة' : 'Commission'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'الصافي' : 'Net Amount'}</th>
                  <th className="px-6 py-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => {
                  const isSubscription = p.paymentType === 'SUBSCRIPTION'
                  const commRate = isSubscription
                    ? 0
                    : p.transaction
                    ? p.transaction.commissionRate
                    : 10
                  const comm = isSubscription
                    ? 0
                    : p.transaction
                    ? p.transaction.commissionAmount
                    : (p.amount * 10) / 100
                  const net = isSubscription
                    ? p.amount
                    : p.transaction
                    ? p.transaction.netAmount
                    : p.amount - comm

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-navy">
                        {p.transactionRef || p.id.slice(0, 10)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-navy">{p.user.name}</div>
                        <div className="text-[11px] text-brand-slate">{p.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full font-bold text-[11px]',
                            isSubscription
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          )}
                        >
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-brand-navy">
                        <span dir="ltr" className="font-mono">{p.amount.toLocaleString()}</span> {language === 'ar' ? 'دج' : 'DA'}
                      </td>
                      <td className="px-6 py-4 text-brand-slate font-bold" dir="ltr">
                        {isSubscription ? (
                          <span className="text-gray-400 font-medium">0%</span>
                        ) : (
                          `${commRate}%`
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-coral">
                        <span dir="ltr" className="font-mono">{comm.toLocaleString()}</span> {language === 'ar' ? 'دج' : 'DA'}
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-teal">
                        <span dir="ltr" className="font-mono">{net.toLocaleString()}</span> {language === 'ar' ? 'دج' : 'DA'}
                      </td>
                      <td className="px-6 py-4 text-brand-slate" dir="ltr">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
