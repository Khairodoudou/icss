'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  Percent,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminDashboardPage() {
  const { language, isRTL } = useLanguage()
  const [statsData, setStatsData] = useState<{
    kpis: {
      totalUsers: number
      totalServices: number
      totalPrograms: number
      pendingRequests: number
      totalRequests: number
      totalBookings: number
      activeSubscriptions: number
      totalGrossRevenue: number
      totalCommissions: number
      totalNetRevenue: number
    }
    requestsDistribution: {
      pending: number
      approved: number
      inProgress: number
      completed: number
      rejected: number
    }
    monthlyRevenue: Array<{ month: string; revenue: number; commissions: number }>
  } | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStatsData(data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !statsData) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    )
  }

  // Line Chart Config (Revenue Trend)
  const lineChartData = {
    labels: statsData.monthlyRevenue.map((d) => d.month),
    datasets: [
      {
        label: language === 'ar' ? 'الإيرادات الإجمالية (دج)' : 'Gross Revenue (DA)',
        data: statsData.monthlyRevenue.map((d) => d.revenue),
        borderColor: '#1D5B79',
        backgroundColor: 'rgba(29, 91, 121, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: language === 'ar' ? 'عمولة المنصة 10% (دج)' : 'Commission 10% (DA)',
        data: statsData.monthlyRevenue.map((d) => d.commissions),
        borderColor: '#E97F6B',
        backgroundColor: 'rgba(233, 127, 107, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Doughnut Chart Config (Request Status)
  const doughnutChartData = {
    labels:
      language === 'ar'
        ? ['قيد المعالجة', 'مقبول', 'قيد الإنجاز', 'مكتمل', 'مرفوض']
        : ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'],
    datasets: [
      {
        data: [
          statsData.requestsDistribution.pending,
          statsData.requestsDistribution.approved,
          statsData.requestsDistribution.inProgress,
          statsData.requestsDistribution.completed,
          statsData.requestsDistribution.rejected,
        ],
        backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#14B8A6', '#EF4444'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  }

  return (
    <div className="space-y-8 text-start">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
          {language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Control Center'}
        </h1>
        <p className="text-xs sm:text-sm text-brand-slate mt-1">
          {language === 'ar'
            ? 'متابعة مؤشرات الأداء، الإيرادات والعمولات والطلبات في الوقت الفعلي.'
            : 'Real-time performance analytics, platform commissions, user base, and request workflows.'}
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand-slate uppercase">
              {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div dir="ltr" className="text-3xl font-black text-brand-navy font-mono text-start">
              {statsData.kpis.totalUsers}
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline mt-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'إدارة المستخدمين' : 'Manage users'}</span>
              <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-270')} />
            </Link>
          </div>
        </div>

        {/* Total Gross Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand-slate uppercase">
              {language === 'ar' ? 'إجمالي المبيعات' : 'Gross Revenue'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black text-brand-navy">
              <span dir="ltr" className="font-mono">{statsData.kpis.totalGrossRevenue.toLocaleString()}</span>
              <span className="text-sm">{language === 'ar' ? 'دج' : 'DA'}</span>
            </div>
            <span className="text-[11px] text-brand-slate mt-1 block">
              {language === 'ar' ? 'مجموع المدفوعات في المنصة' : 'Platform gross sales'}
            </span>
          </div>
        </div>

        {/* Total Commissions */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand-slate uppercase">
              {language === 'ar' ? 'العمولات المحصلة (10%)' : 'Commissions (10%)'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-coral/15 text-brand-coral flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black text-brand-coral">
              <span dir="ltr" className="font-mono">{statsData.kpis.totalCommissions.toLocaleString()}</span>
              <span className="text-sm">{language === 'ar' ? 'دج' : 'DA'}</span>
            </div>
            <Link
              href="/admin/commissions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-coral hover:underline mt-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'تفاصيل العمولات' : 'View commission details'}</span>
              <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-270')} />
            </Link>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand-slate uppercase">
              {language === 'ar' ? 'طلبات بانتظار المراجعة' : 'Pending Requests'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div dir="ltr" className="text-3xl font-black text-brand-navy font-mono text-start">
              {statsData.kpis.pendingRequests}
            </div>
            <Link
              href="/admin/requests"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline mt-2 cursor-pointer"
            >
              <span>{language === 'ar' ? 'مراجعة الطلبات' : 'Review requests'}</span>
              <ArrowUpRight className={cn('w-3.5 h-3.5', isRTL && 'rotate-270')} />
            </Link>
          </div>
        </div>
      </div>

      {/* Chart.js Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Line Chart: Revenue Trend (Span 8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
          <div className="mb-6">
            <h3 className="text-base font-bold text-brand-navy">
              {language === 'ar' ? 'تطور الإيرادات والعمولات' : 'Revenue & Commission Trends'}
            </h3>
            <p className="text-xs text-brand-slate">
              {language === 'ar' ? 'منحنى النمو الشهري بالدينار الجزائري (دج)' : 'Monthly growth projection in Algerian Dinars (DA)'}
            </p>
          </div>
          <div className="h-72 w-full">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  y: { grid: { color: '#F1F5F9' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Doughnut Chart: Requests Breakdown (Span 4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-bold text-brand-navy">
              {language === 'ar' ? 'توزيع حالات الطلبات' : 'Request Statuses'}
            </h3>
            <p className="text-xs text-brand-slate">
              {language === 'ar' ? 'نسب توزيع طلبات رواد الأعمال' : 'Distribution of client requests'}
            </p>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
