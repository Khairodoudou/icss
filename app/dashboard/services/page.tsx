'use client'

import { useState, useEffect, useMemo } from 'react'
import { Clock, Loader2, X, Plus, Send, Search, Filter } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Service {
  id: string
  title: string
  description: string
  price: number
  duration: string
  category: string
}

export default function ServicesPage() {
  const { language, isRTL } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    services.forEach((s) => {
      if (s.category) set.add(s.category)
    })
    return Array.from(set)
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesCategory

      const matchesSearch =
        s.title?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.duration?.toLowerCase().includes(q) ||
        s.price?.toString().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [services, selectedCategory, searchQuery])

  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: services.length }
    categories.forEach((cat) => {
      res[cat] = services.filter((s) => s.category === cat).length
    })
    return res
  }, [services, categories])

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !message.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          message,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(language === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Service request submitted successfully!')
        setSelectedService(null)
        setMessage('')
      } else {
        toast.error(data.error || 'Failed to submit request')
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

  return (
    <div className="space-y-8 text-start">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          {language === 'ar' ? 'استكشف الخدمات المتاحة' : 'Available Services'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate mt-1">
          {language === 'ar'
            ? 'اختر الخدمة المناسبة لمشروعك وأرسل طلب مرافقة مخصص.'
            : 'Select the ideal training or coaching service for your startup and submit a request.'}
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
                  ? 'بحث في الخدمات المتاحة، الوصف، أو السعر...'
                  : 'Search services by title, description, price...'
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
              ? `عرض ${filteredServices.length} من أصل ${services.length} خدمة`
              : `Showing ${filteredServices.length} of ${services.length} services`}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0',
              selectedCategory === 'ALL'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'bg-gray-100 text-brand-slate hover:bg-gray-200'
            )}
          >
            <span>{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</span>
            <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', selectedCategory === 'ALL' ? 'bg-white/20' : 'bg-gray-200 text-brand-slate')}>
              {counts.ALL || 0}
            </span>
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border',
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                    : 'bg-white text-brand-slate border-gray-200 hover:bg-gray-50'
                )}
              >
                <span>{cat}</span>
                <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', isActive ? 'bg-white/20' : 'bg-gray-100 text-brand-slate')}>
                  {counts[cat] || 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-brand-navy mb-1">
            {language === 'ar' ? 'لا توجد خدمات مطابقة' : 'No matching services found'}
          </h3>
          <p className="text-xs text-brand-slate mb-4">
            {language === 'ar'
              ? 'جرب تغيير كلمة البحث أو اختيار فئة أخرى.'
              : 'Try adjusting your search query or reset category filter.'}
          </p>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('ALL')
              }}
              className="btn-primary text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold text-brand-blue uppercase bg-brand-blue/10 px-3 py-1 rounded-full">
                    {service.category || (language === 'ar' ? 'خدمة' : 'Service')}
                  </span>
                  <span className="text-xs text-brand-slate flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration}</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-brand-navy mb-2">{service.title}</h3>
                <p className="text-xs sm:text-sm text-brand-slate leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <span className="text-[10px] text-brand-slate block uppercase font-bold tracking-wider">
                    {language === 'ar' ? 'السعر' : 'Price'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span dir="ltr" className="text-xl font-extrabold text-brand-blue font-mono">
                      {service.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-brand-blue">
                      {language === 'ar' ? 'دج' : 'DA'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedService(service)}
                  className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'طلب الخدمة' : 'Request Service'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 relative text-start">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {language === 'ar' ? 'طلب الخدمة' : 'Request Service'}
            </h3>
            <p className="text-xs text-brand-blue font-semibold mb-6">{selectedService.title}</p>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  {language === 'ar'
                    ? 'اشرح احتياجاتك وأهدافك من هذه الخدمة'
                    : 'Describe your goals and expectations for this service'}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'أريد تطوير مهارات فريقي في تقديم العروض أمام المستثمرين الأجانب...'
                      : 'We want to prepare our seed pitch deck and improve verbal presentation for European investors...'
                  }
                  required
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue resize-none text-start"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}</span>
                    </>
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
