import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const DEFAULT_PLANS = [
  {
    name: 'FREE',
    price: 0,
    billingPeriod: 'MONTHLY',
    features: JSON.stringify([
      'الوصول إلى الخدمات',
      'تصفح البرامج التدريبية',
      'الدعم عبر البريد الإلكتروني',
      'متابعة الطلبات الأساسية',
    ]),
    isActive: true,
  },
  {
    name: 'STARTUP',
    price: 2000,
    billingPeriod: 'MONTHLY',
    features: JSON.stringify([
      'الوصول لجميع الخدمات',
      'الحجوزات مشمولة',
      'خصومات حصرية على البرامج',
      'متابعة الطلبات الكاملة',
      'دعم ذو أولوية',
    ]),
    isActive: true,
  },
  {
    name: 'PREMIUM',
    price: 5000,
    billingPeriod: 'MONTHLY',
    features: JSON.stringify([
      'جميع مزايا ستارتب',
      'تدريب شخصي مخصص 1-على-1',
      'الوصول لخبراء معتمدين',
      'أولوية كاملة في الحجوزات',
      'تقرير أداء شهري مخصص',
    ]),
    isActive: true,
  },
]

async function ensureDefaultPlans() {
  try {
    const existing = await prisma.subscriptionPlan.findMany()
    const existingNames = new Set(existing.map((p) => p.name.toUpperCase()))

    for (const plan of DEFAULT_PLANS) {
      if (!existingNames.has(plan.name)) {
        await prisma.subscriptionPlan.upsert({
          where: { name: plan.name },
          update: plan,
          create: plan,
        })
      }
    }
  } catch (err) {
    console.error('Error ensuring default subscription plans:', err)
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await ensureDefaultPlans()

    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        plans: plans.map((p) => ({
          ...p,
          features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
        })),
        currentSubscription: subscription
          ? {
              ...subscription,
              plan: {
                ...subscription.plan,
                features:
                  typeof subscription.plan.features === 'string'
                    ? JSON.parse(subscription.plan.features)
                    : subscription.plan.features,
              },
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch subscription data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, planKey, planName, name, billingCycle = 'monthly' } = body

    const targetKey = (planKey || planName || name || '').toString().trim().toUpperCase()

    let plan = null

    // 1. Try finding by ID if provided
    if (planId && typeof planId === 'string' && planId.trim() !== '') {
      plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })
    }

    // 2. If not found by ID, look up by name or key
    if (!plan && targetKey) {
      plan = await prisma.subscriptionPlan.findFirst({
        where: {
          name: { equals: targetKey },
        },
      })

      // Try matching alias names (e.g. Starter -> FREE, Professional -> STARTUP, Enterprise -> PREMIUM)
      if (!plan) {
        const allPlans = await prisma.subscriptionPlan.findMany()
        plan = allPlans.find((p) => {
          const pUpper = p.name.toUpperCase()
          if (pUpper === targetKey) return true
          if (targetKey === 'STARTUP' && (pUpper === 'STARTUP' || pUpper === 'PROFESSIONAL')) return true
          if (targetKey === 'FREE' && (pUpper === 'FREE' || pUpper === 'STARTER')) return true
          if (targetKey === 'PREMIUM' && (pUpper === 'PREMIUM' || pUpper === 'ENTERPRISE')) return true
          return false
        })
      }
    }

    // 3. If still not found, check if it's one of the default standard plans and auto-create it
    if (!plan && (targetKey === 'FREE' || targetKey === 'STARTUP' || targetKey === 'PREMIUM')) {
      const defaultDef = DEFAULT_PLANS.find((dp) => dp.name === targetKey) || DEFAULT_PLANS[1]
      plan = await prisma.subscriptionPlan.upsert({
        where: { name: defaultDef.name },
        update: defaultDef,
        create: defaultDef,
      })
    }

    // 4. Fallback if still not found: ensure default plans and pick matching or default plan
    if (!plan) {
      await ensureDefaultPlans()
      if (targetKey) {
        plan = await prisma.subscriptionPlan.findFirst({
          where: { name: targetKey },
        })
      }
    }

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Subscription plan not found. Please select a valid plan.' },
        { status: 400 }
      )
    }

    // Expire old active subscriptions for this user
    await prisma.subscription.updateMany({
      where: { userId: user.id, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    })

    const startDate = new Date()
    const endDate = new Date()
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
      },
      include: { plan: true },
    })

    // Optionally notify user
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'تم تفعيل الاشتراك بنجاح',
          message: `تم تفعيل اشتراكك في خطة ${plan.name} (${billingCycle === 'yearly' ? 'السنوية' : 'الشهرية'}) بنجاح.`,
          type: 'SYSTEM',
        },
      })
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true, data: subscription }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json({ success: false, error: 'Failed to create subscription' }, { status: 500 })
  }
}
