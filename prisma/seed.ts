import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/bcrypt'

async function main() {
  console.log('Seeding database...')

  // 1. Create Admin User
  const adminPassword = await hashPassword('123456789')
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+213 555 000 000',
      company: 'ICSS Platform',
    },
  })

  // 2. Create Demo Client User
  const userPassword = await hashPassword('user123456')
  const clientUser = await prisma.user.upsert({
    where: { email: 'ahmed@startup.dz' },
    update: {},
    create: {
      name: 'Ahmed Benali',
      email: 'ahmed@startup.dz',
      password: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      phone: '+213 555 123 456',
      company: 'TechNovation DZ',
    },
  })

  // 3. Create Services
  const services = [
    {
      title: 'Business English',
      description: 'Strengthen your professional English skills to communicate confidently with international clients and investors.',
      price: 15000,
      duration: '4 weeks',
      category: 'Language & Business',
    },
    {
      title: 'Pitch & Presentation',
      description: 'Prepare compelling pitches and presentations to convince investors, partners and prospective customers.',
      price: 12000,
      duration: '3 weeks',
      category: 'Coaching',
    },
    {
      title: 'International Communication',
      description: 'Master cross-border negotiation, business etiquette and clear communication strategies for global growth.',
      price: 15000,
      duration: '4 weeks',
      category: 'International Strategy',
    },
    {
      title: 'Digital Communication',
      description: 'Develop a strong digital presence, modern branding and social media strategy for your venture.',
      price: 10000,
      duration: '3 weeks',
      category: 'Digital Strategy',
    },
  ]

  const createdServices: Array<{ id: string; title: string; price: number }> = []

  for (const s of services) {
    let existing = await prisma.service.findFirst({ where: { title: s.title } })
    if (!existing) {
      existing = await prisma.service.create({ data: s })
    }
    createdServices.push(existing)
  }

  // 4. Create Programs
  const programs = [
    {
      title: 'Business English Program',
      description: 'Comprehensive 8-week intensive program designed for founders and executives navigating international business.',
      price: 15000,
      duration: '8 weeks',
      level: 'All Levels',
      sessions: 8,
    },
    {
      title: 'Pitch Preparation Program',
      description: 'Practical training focusing on slide design, verbal delivery, investor Q&A and storytelling.',
      price: 12000,
      duration: '6 weeks',
      level: 'Intermediate',
      sessions: 6,
    },
    {
      title: 'International Communication',
      description: 'Deep dive into cultural nuances, international business writing and remote partnership management.',
      price: 15000,
      duration: '8 weeks',
      level: 'Advanced',
      sessions: 8,
    },
    {
      title: 'Digital Communication Training',
      description: 'Hands-on workshops on content strategy, LinkedIn for founders and digital PR.',
      price: 10000,
      duration: '6 weeks',
      level: 'All Levels',
      sessions: 6,
    },
  ]

  for (const p of programs) {
    const existing = await prisma.program.findFirst({ where: { title: p.title } })
    if (!existing) {
      await prisma.program.create({ data: p })
    }
  }

  // 5. Create Subscription Plans
  const plans = [
    {
      name: 'FREE',
      price: 0,
      billingPeriod: 'MONTHLY',
      features: JSON.stringify([
        'Access to basic service catalog',
        'Browse available programs',
        'Email support',
        'Basic request tracking',
      ]),
    },
    {
      name: 'STARTUP',
      price: 2000,
      billingPeriod: 'MONTHLY',
      features: JSON.stringify([
        'Full access to all services',
        'Session bookings included',
        '10% discounts on all programs',
        'Real-time request tracking',
        'Priority support',
      ]),
    },
    {
      name: 'PREMIUM',
      price: 5000,
      billingPeriod: 'MONTHLY',
      features: JSON.stringify([
        'All Startup plan benefits',
        '1-on-1 personalized mentoring',
        'Direct access to senior experts',
        'Unlimited priority booking',
        'Monthly growth report',
      ]),
    },
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    })
  }

  // 6. Give Demo Client an active Startup Subscription
  const startupPlan = await prisma.subscriptionPlan.findUnique({ where: { name: 'STARTUP' } })
  if (startupPlan) {
    const existingSub = await prisma.subscription.findFirst({ where: { userId: clientUser.id } })
    if (!existingSub) {
      const now = new Date()
      const end = new Date()
      end.setMonth(end.getMonth() + 1)
      await prisma.subscription.create({
        data: {
          userId: clientUser.id,
          planId: startupPlan.id,
          status: 'ACTIVE',
          startDate: now,
          endDate: end,
        },
      })
    }
  }

  // 7. Seed Demo Bookings
  const existingBookingsCount = await prisma.booking.count()
  if (existingBookingsCount === 0 && createdServices.length > 0) {
    await prisma.booking.createMany({
      data: [
        {
          userId: clientUser.id,
          serviceId: createdServices[0].id,
          date: '2026-08-28',
          time: '10:30',
          status: 'CONFIRMED',
          notes: 'Pitch deck review session for European investors presentation.',
        },
        {
          userId: clientUser.id,
          serviceId: createdServices[1].id,
          date: '2026-09-02',
          time: '14:00',
          status: 'PENDING',
          notes: 'Business English negotiation simulation session.',
        },
      ],
    })
  }

  // 8. Seed Demo Service Requests
  const existingRequestsCount = await prisma.serviceRequest.count()
  if (existingRequestsCount === 0 && createdServices.length > 0) {
    await prisma.serviceRequest.createMany({
      data: [
        {
          userId: clientUser.id,
          serviceId: createdServices[0].id,
          message: 'We are raising Seed funding and need to refine our 10-minute pitch deck.',
          status: 'IN_PROGRESS',
          adminNote: 'Assigned to senior communication advisor. Next session scheduled.',
        },
        {
          userId: clientUser.id,
          serviceId: createdServices[2].id,
          message: 'Training needed for cross-border contracts and negotiation with partners in Dubai.',
          status: 'PENDING',
        },
      ],
    })
  }

  // 9. Seed Demo Payments & Transactions (with 10% commission)
  const existingPaymentsCount = await prisma.payment.count()
  if (existingPaymentsCount === 0) {
    const p1 = await prisma.payment.create({
      data: {
        userId: clientUser.id,
        amount: 15000,
        paymentType: 'SERVICE',
        status: 'PAID',
        transactionRef: 'TX-2026-89412',
      },
    })

    await prisma.transaction.create({
      data: {
        paymentId: p1.id,
        grossAmount: 15000,
        commissionRate: 10,
        commissionAmount: 1500,
        netAmount: 13500,
      },
    })

    const p2 = await prisma.payment.create({
      data: {
        userId: clientUser.id,
        amount: 2000,
        paymentType: 'SUBSCRIPTION',
        status: 'PAID',
        transactionRef: 'TX-2026-89413',
      },
    })

    await prisma.transaction.create({
      data: {
        paymentId: p2.id,
        grossAmount: 2000,
        commissionRate: 10,
        commissionAmount: 200,
        netAmount: 1800,
      },
    })
  }

  console.log('Database seeded successfully with users, services, programs, bookings, and transactions!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
