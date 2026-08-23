'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, Search, X, Filter } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ServiceRequestItem {
  id: string
  message: string
  status: string
  adminNote?: string | null
  createdAt: string
  service: { title: string; price: number }
  user: { name: string; email: string; company?: string | null }
}

export default function AdminRequestsPage() {
  const { language } = useLanguage()
  const [requests, setRequests] = useState<ServiceRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

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

  const handleUpdateStatus = async (id: string, status: string, adminNote?: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(
          language === 'ar'
            ? `تم تحديث حالة الطلب بنجاح!`
            : `Request status updated to ${status}`
        )
        fetchRequests()
      }
    } catch {
      toast.error('Failed to update request')
    } finally {
      setUpdatingId(null)
    }
  }

  const STATUS_META: Record<string, { en: string; ar: string; class: string }> = {
    PENDING: { en: 'Pending', ar: 'قيد المعالجة', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { en: 'Approved', ar: 'مقبول', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { en: 'In Progress', ar: 'قيد الإنجاز', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    COMPLETED: { en: 'Completed', ar: 'مكتمل', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { en: 'Rejected', ar: 'مرفوض', class: 'bg-red-50 text-red-700 border-red-200' },
  }

  // Filtered requests computation
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesStatus

      const matchesSearch =
        req.user.name?.toLowerCase().includes(q) ||
        req.user.email?.toLowerCase().includes(q) ||
        req.user.company?.toLowerCase().includes(q) ||
        req.service.title?.toLowerCase().includes(q) ||
        req.message?.toLowerCase().includes(q) ||
        req.id?.toLowerCase().includes(q)

      return matchesStatus && matchesSearch
    })
  }, [requests, statusFilter, searchQuery])

  // Counts for each tab
  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: requests.length }
    for (const key of Object.keys(STATUS_META)) {
      res[key] = requests.filter((r) => r.status === key).length
    }
    return res
  }, [requests])

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          {language === 'ar' ? 'إدارة طلبات الخدمات' : 'Service Requests Workflow'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate mt-1">
          {language === 'ar'
            ? 'مراجعة وتحديث حالة طلبات المرافقة والتدريب المرسلة من العملاء.'
            : 'Review, approve, assign and track coaching requests from startups.'}
        </p>
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
                  ? 'بحث بالعميل، البريد، المؤسسة، أو الخدمة...'
                  : 'Search by client, email, company, service...'
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

        {/* Status Filter Pills */}
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
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
            <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'لا توجد طلبات مطابقة' : 'No matching requests found'}
            </h3>
            <p className="text-xs text-brand-slate mb-4">
              {language === 'ar'
                ? 'جرب تغيير كلمة البحث أو إعادة تعيين الفلاتر.'
                : 'Try adjusting your search or clear filters to see more results.'}
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
          filteredRequests.map((req) => {
            const status = STATUS_META[req.status] || {
              en: req.status,
              ar: req.status,
              class: 'bg-gray-50 text-gray-700 border-gray-200',
            }

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs flex flex-col justify-between gap-5"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">
                      {req.service.title}
                    </span>
                    <h3 className="text-base font-bold text-brand-navy mt-2">
                      {req.user.name} {req.user.company ? `(${req.user.company})` : ''}
                    </h3>
                    <span className="text-xs text-brand-slate">{req.user.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-slate" dir="ltr">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold px-3 py-1 rounded-full border',
                        status.class
                      )}
                    >
                      {language === 'ar' ? status.ar : status.en}
                    </span>
                  </div>
                </div>

                {/* Client message content */}
                <div className="bg-gray-50 p-4 rounded-2xl text-xs text-brand-slate leading-relaxed">
                  <span className="font-bold text-brand-navy block mb-1">
                    {language === 'ar' ? 'تفاصيل الطلب من العميل:' : 'Message:'}
                  </span>
                  {req.message}
                </div>

                {/* Admin Action Buttons Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="text-xs text-brand-slate">
                    {language === 'ar' ? 'السعر:' : 'Price:'}{' '}
                    <span className="font-bold text-brand-navy">
                      <span dir="ltr" className="font-mono">{req.service.price.toLocaleString()}</span> {language === 'ar' ? 'دج' : 'DA'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {req.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'APPROVED', language === 'ar' ? 'تمت الموافقة على طلبكم.' : 'Your request has been approved.')}
                        disabled={updatingId === req.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'قبول الطلب' : 'Approve'}
                      </button>
                    )}
                    {req.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS', language === 'ar' ? 'المرافقة قيد التنفيذ حالياً.' : 'Training is currently in progress.')}
                        disabled={updatingId === req.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'قيد التنفيذ' : 'Set In-Progress'}
                      </button>
                    )}
                    {req.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED', language === 'ar' ? 'تم إكمال الخدمة بنجاح.' : 'Service successfully completed.')}
                        disabled={updatingId === req.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'تم الإكمال' : 'Complete'}
                      </button>
                    )}
                    {req.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'REJECTED', language === 'ar' ? 'تم رفض الطلب.' : 'Service request declined.')}
                        disabled={updatingId === req.id}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'رفض' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

