import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') // e.g. ?status=APPROVED

    // Clients always scoped to their own requests — NEVER expose other users' requests
    const where = user.role === 'ADMIN'
      ? (statusFilter ? { status: statusFilter } : {})
      : { userId: user.id, ...(statusFilter ? { status: statusFilter } : {}) }

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        service: true,
        bookings: {
          select: { id: true, status: true, date: true, time: true },
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: { id: true, name: true, email: true, company: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch successful payments to check payment status
    const payments = await prisma.payment.findMany({
      where: user.role === 'ADMIN' ? { status: 'SUCCESS' } : { userId: user.id, status: 'SUCCESS' },
      select: { id: true, amount: true, referenceId: true, transactionRef: true, status: true, createdAt: true },
    })

    const requestsWithPayment = requests.map((req) => {
      const payment = payments.find(
        (p) =>
          p.referenceId === req.id ||
          p.referenceId === req.serviceId ||
          p.referenceId === req.service.title
      )
      return {
        ...req,
        isPaid: !!payment,
        payment: payment || null,
      }
    })

    return NextResponse.json({ success: true, data: requestsWithPayment })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, message } = body

    if (!serviceId || !message) {
      return NextResponse.json({ success: false, error: 'Service and message are required' }, { status: 400 })
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        userId: user.id,
        serviceId,
        message,
        status: 'PENDING',
      },
      include: { service: true },
    })

    return NextResponse.json({ success: true, data: serviceRequest }, { status: 201 })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ success: false, error: 'Failed to create request' }, { status: 500 })
  }
}
