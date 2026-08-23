'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const { language, isRTL } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid email or password')
        toast.error(data.error || 'Authentication failed')
        return
      }

      toast.success(`Welcome back, ${data.data.user.name}!`)

      if (data.data.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
      toast.error('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-sky-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-brand-blue/5 rounded-3xl border border-gray-100"
          >
            {/* Logo at the top of the card */}
            <div className="flex justify-center mb-6">
              <Link href="/" className="inline-block">
                <div className="relative h-14 sm:h-16 w-52 sm:w-60">
                  <Image
                    src="/logo.jpg"
                    alt="ICSS Platform"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight">
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign in to ICSS'}
              </h2>
              <p className="text-xs text-brand-slate mt-2">
                {language === 'ar'
                  ? 'أدخل بياناتك للوصول إلى مساحتك والخدمات'
                  : 'Access your personal dashboard and services'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-start">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@domaine.dz"
                    required
                    className="w-full py-2.5 ps-10 pe-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1.5">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full py-2.5 ps-10 pe-10 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 end-3 flex items-center text-brand-slate hover:text-brand-blue transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-brand-coral hover:bg-brand-coral-dark transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-6 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</span>
                    <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                  </>
                )}
              </button>
            </form>



            {/* Switch to Register */}
            <div className="mt-6 text-center text-xs text-brand-slate">
              <span>
                {language === 'ar' ? 'ليس لديك حساب بعد؟ ' : "Don't have an account yet? "}
              </span>
              <Link href="/register" className="font-bold text-brand-blue hover:underline">
                {language === 'ar' ? 'إنشاء حساب جديد' : 'Create an account'}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
