'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, X, Loader2, Clock, Search, Filter, Pencil, Trash2, AlertTriangle } from 'lucide-react'
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

type ModalMode = 'create' | 'edit' | 'delete' | null

export default function AdminServicesPage() {
  const { language } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('4 weeks')
  const [category, setCategory] = useState('Business English')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      if (data.success) setServices(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
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

  const openCreateModal = () => {
    setSelectedService(null)
    setTitle('')
    setDescription('')
    setPrice('')
    setDuration('4 weeks')
    setCategory('Business English')
    setModalMode('create')
  }

  const openEditModal = (service: Service) => {
    setSelectedService(service)
    setTitle(service.title)
    setDescription(service.description)
    setPrice(service.price.toString())
    setDuration(service.duration)
    setCategory(service.category)
    setModalMode('edit')
  }

  const openDeleteModal = (service: Service) => {
    setSelectedService(service)
    setModalMode('delete')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedService(null)
  }

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !price) return

    setIsSubmitting(true)
    try {
      const isEdit = modalMode === 'edit' && selectedService
      const url = isEdit ? `/api/services/${selectedService.id}` : '/api/services'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          duration,
          category,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(
          isEdit
            ? language === 'ar' ? 'تم تعديل الخدمة بنجاح!' : 'Service updated successfully!'
            : language === 'ar' ? 'تمت إضافة الخدمة بنجاح!' : 'Service created successfully!'
        )
        closeModal()
        fetchServices()
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteService = async () => {
    if (!selectedService) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/services/${selectedService.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(language === 'ar' ? 'تم حذف الخدمة بنجاح!' : 'Service deleted successfully!')
        closeModal()
        fetchServices()
      } else {
        toast.error(data.error || 'Failed to delete service')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
            {language === 'ar' ? 'كتالوج الخدمات' : 'Services Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'إدارة الخدمات، الأسعار والتفاصيل المعروضة على المنصة.'
              : 'Create, edit and delete service offerings, pricing, and curriculum durations.'}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة خدمة جديدة' : 'Add Service'}</span>
        </button>
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
                  ? 'بحث في عنوان الخدمة، الوصف، أو السعر...'
                  : 'Search by service title, description, price...'
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
              className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
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
              className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold text-brand-blue uppercase bg-brand-blue/10 px-3 py-1 rounded-full">
                    {service.category || (language === 'ar' ? 'خدمة' : 'Service')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-slate flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.duration}</span>
                    </span>
                    {/* Edit & Delete Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(service)}
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                        className="p-1.5 rounded-lg text-brand-slate hover:text-brand-blue hover:bg-brand-blue/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(service)}
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                        className="p-1.5 rounded-lg text-brand-slate hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{service.title}</h3>
                <p className="text-xs text-brand-slate leading-relaxed mb-4">{service.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-lg font-black text-brand-navy">
                  <span dir="ltr" className="font-mono">{service.price.toLocaleString()}</span> {language === 'ar' ? 'دج' : 'DA'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {language === 'ar' ? 'متاحة' : 'Active'}
                  </span>
                  {/* Inline action buttons (always visible on mobile) */}
                  <div className="flex items-center gap-1 md:hidden">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 rounded-lg text-brand-slate hover:text-brand-blue hover:bg-brand-blue/10 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(service)}
                      className="p-1.5 rounded-lg text-brand-slate hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative text-start">
            <button
              onClick={closeModal}
              className="absolute top-5 end-5 text-gray-400 hover:text-brand-navy p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-brand-navy mb-1">
              {modalMode === 'edit'
                ? language === 'ar' ? 'تعديل الخدمة' : 'Edit Service'
                : language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}
            </h3>
            <p className="text-xs text-brand-slate mb-6">
              {modalMode === 'edit'
                ? language === 'ar' ? 'عدّل تفاصيل الخدمة ثم احفظ التغييرات' : 'Update service details and save changes'
                : language === 'ar' ? 'أدخل تفاصيل الخدمة والمدة والتسعيرة' : 'Enter service name, pricing and details'}
            </p>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1">
                  {language === 'ar' ? 'عنوان الخدمة' : 'Service Title'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: دورة تقديم المشاريع' : 'e.g. Masterclass Pitching'}
                  required
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1">
                  {language === 'ar' ? 'الوصف والأهداف' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={language === 'ar' ? 'تفاصيل المحتوى والمخرجات...' : 'Describe curriculum and outcomes...'}
                  required
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1">
                    {language === 'ar' ? 'السعر (دج)' : 'Price (DA)'}
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15000"
                    required
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy mb-1">
                    {language === 'ar' ? 'المدة' : 'Duration'}
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={language === 'ar' ? '4 أسابيع' : '4 weeks'}
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1">
                  {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: Business English' : 'e.g. Business English'}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-semibold py-3 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>
                      {modalMode === 'edit'
                        ? language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'
                        : language === 'ar' ? 'إنشاء الخدمة' : 'Create Service'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {modalMode === 'delete' && selectedService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 relative text-center">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-brand-navy mb-2">
              {language === 'ar' ? 'حذف الخدمة' : 'Delete Service'}
            </h3>
            <p className="text-xs text-brand-slate mb-1">
              {language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?'}
            </p>
            <p className="text-sm font-bold text-brand-navy mb-6 bg-gray-50 rounded-xl px-3 py-2">
              &quot;{selectedService.title}&quot;
            </p>
            <p className="text-[11px] text-red-500 mb-6">
              {language === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه.' : 'This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl text-xs font-semibold border border-gray-200 text-brand-slate hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteService}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
