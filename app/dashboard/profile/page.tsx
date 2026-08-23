'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building, Loader2, Save, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { language } = useLanguage()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile({
            name: data.data.user.name || '',
            email: data.data.user.email || '',
            phone: data.data.user.phone || '',
            company: data.data.user.company || '',
            role: data.data.user.role || 'USER',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          company: profile.company,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(
          language === 'ar'
            ? 'تم حفظ بيانات الملف الشخصي بنجاح!'
            : 'Profile updated successfully!'
        )
        setCurrentPassword('')
        setNewPassword('')
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsSaving(false)
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
    <div className="space-y-8 max-w-2xl mx-auto text-start">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          {language === 'ar' ? 'الملف الشخصي' : 'My Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate mt-1">
          {language === 'ar'
            ? 'قم بتحديث معلوماتك المهنية، بيانات الاتصال وكلمة المرور الخاصة بك.'
            : 'Manage your personal account settings, company information, and password.'}
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar and Name Preview */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue text-white text-2xl font-black flex items-center justify-center shadow-md">
              {profile.name ? profile.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy">{profile.name}</h3>
              <span className="text-xs text-brand-sky font-semibold bg-brand-blue/10 px-2.5 py-0.5 rounded-full inline-block mt-1">
                {profile.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1.5">
              {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                className="w-full py-2.5 ps-10 pe-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1.5">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full py-2.5 ps-10 pe-3 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1.5">
              {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+213 555 123 456"
                className="w-full py-2.5 ps-10 pe-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1.5">
              {language === 'ar' ? 'اسم الشركة / المؤسسة الناشئة' : 'Company / Startup Name'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                placeholder="TechNovation DZ"
                className="w-full py-2.5 ps-10 pe-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          {/* Password Update Section */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-brand-coral" />
              <h4 className="text-sm font-bold text-brand-navy">
                {language === 'ar' ? 'تغيير كلمة المرور (اختياري)' : 'Change Password (Optional)'}
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-brand-slate mb-1">
                  {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2.5 ps-9 pe-10 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 end-3 flex items-center text-brand-slate hover:text-brand-blue cursor-pointer"
                    aria-label="Toggle password"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-slate mb-1">
                  {language === 'ar' ? 'كلمة المرور الجديدة (8 أحرف على الأقل)' : 'New Password (min 8 characters)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2.5 ps-9 pe-10 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 end-3 flex items-center text-brand-slate hover:text-brand-blue cursor-pointer"
                    aria-label="Toggle password"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full btn-primary text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
