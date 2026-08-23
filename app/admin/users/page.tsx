'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Trash2 } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  status: string
  phone?: string | null
  company?: string | null
  createdAt: string
  _count: {
    requests: number
    bookings: number
    subscriptions: number
    payments: number
  }
}

export default function AdminUsersPage() {
  const { language } = useLanguage()
  const [users, setUsers] = useState<UserItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(
          language === 'ar'
            ? `تم تحديث حالة المستخدم ${user.name} إلى ${newStatus === 'ACTIVE' ? 'نشط' : 'موقوف'} بنجاح!`
            : `User ${user.name} status updated to ${newStatus}`
        )
        fetchUsers()
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteUser = async (user: UserItem) => {
    if (user.role === 'ADMIN') {
      toast.error(
        language === 'ar' ? 'لا يمكن حذف حساب المسؤول' : 'Cannot delete admin account'
      )
      return
    }

    const confirmMsg =
      language === 'ar'
        ? `هل أنت متأكد من حذف حساب "${user.name}" نهائياً؟ سيتم حذف جميع بياناته المرتبطة.`
        : `Are you sure you want to permanently delete user "${user.name}"? All associated data will be deleted.`

    if (!window.confirm(confirmMsg)) return

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(
          language === 'ar'
            ? `تم حذف المستخدم ${user.name} بنجاح!`
            : `User ${user.name} deleted successfully`
        )
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting user')
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(search.toLowerCase()))
  )

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
            {language === 'ar' ? 'إدارة المستخدمين' : 'Users Management'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-slate mt-1">
            {language === 'ar'
              ? 'عرض وتعديل حسابات رواد الأعمال وأذونات الوصول والحالة.'
              : 'View, filter, and manage entrepreneur profiles, roles, and access statuses.'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-brand-slate">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search users...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 ps-9 pe-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-gray-50/80 text-brand-slate uppercase font-bold text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'الشركة / المشروع' : 'Company'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'الدور' : 'Role'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'النشاط' : 'Activity'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'تاريخ الانضمام' : 'Joined'}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-navy">{u.name}</div>
                    <div className="text-[11px] text-brand-slate">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-brand-navy font-medium">
                    {u.company || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase',
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      )}
                    >
                      {u.role === 'ADMIN' ? (language === 'ar' ? 'مشرف' : 'ADMIN') : (language === 'ar' ? 'عميل' : 'USER')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {u.status === 'ACTIVE' ? (language === 'ar' ? 'نشط' : 'ACTIVE') : (language === 'ar' ? 'موقوف' : 'SUSPENDED')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-brand-slate">
                    <span dir="ltr">
                      {u._count.requests} {language === 'ar' ? 'طلبات' : 'reqs'} • {u._count.bookings} {language === 'ar' ? 'حجوزات' : 'books'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-brand-slate" dir="ltr">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={cn(
                          'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer',
                          u.status === 'ACTIVE'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        )}
                      >
                        {u.status === 'ACTIVE'
                          ? language === 'ar'
                            ? 'تجميد الحساب'
                            : 'Suspend'
                          : language === 'ar'
                          ? 'تفعيل الحساب'
                          : 'Activate'}
                      </button>

                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          title={language === 'ar' ? 'حذف المستخدم' : 'Delete user'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
