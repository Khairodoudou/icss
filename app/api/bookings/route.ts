import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const where = user.role === 'ADMIN' ? {} : { userId: user.id }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
        serviceRequest: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const payments = await prisma.payment.findMany({
      where: user.role === 'ADMIN' ? { status: 'SUCCESS' } : { userId: user.id, status: 'SUCCESS' },
      select: { id: true, amount: true, referenceId: true, transactionRef: true, status: true, createdAt: true },
    })

    const bookingsWithPayment = bookings.map((b) => {
      const payment = payments.find(
        (p) =>
          (b.serviceRequestId && p.referenceId === b.serviceRequestId) ||
          p.referenceId === b.serviceId ||
          p.referenceId === b.service.title
      )
      return {
        ...b,
        isPaid: !!payment,
        payment: payment || null,
      }
    })

    return NextResponse.json({ success: true, data: bookingsWithPayment })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceRequestId, date, time, notes } = body

    // ── 1. Required fields ──────────────────────────────────────────────────
    if (!serviceRequestId || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'serviceRequestId, date and time are required' },
        { status: 400 }
      )
    }

    // ── 2. Load the service request ─────────────────────────────────────────
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      )
    }

    // ── 3. Ownership check — prevent booking on another user's request ───────
    if (serviceRequest.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden — this request does not belong to you' },
        { status: 403 }
      )
    }

    // ── 4. Status check — only APPROVED requests can be booked ──────────────
    if (serviceRequest.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot book a session — request status is "${serviceRequest.status}". Only APPROVED requests can be booked.`,
        },
        { status: 400 }
      )
    }

    // ── 5. serviceId is extracted from the request server-side ──────────────
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: serviceRequest.serviceId,   // always from the approved request
        serviceRequestId: serviceRequest.id,
        date,
        time,
        notes,
        status: 'PENDING',
      },
      include: {
        service: true,
        serviceRequest: { include: { service: true } },
      },
    })

    return NextResponse.json({ success: true, data: booking }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create booking' },
      { status: 500 }
    )
  }
}
