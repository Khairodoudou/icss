import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Helper to auto-sync any completed bookings/requests that are missing payment records
async function syncCompletedPayments(targetUserId?: string) {
  try {
    const bookingWhere = targetUserId
      ? { userId: targetUserId, status: 'COMPLETED' }
      : { status: 'COMPLETED' }

    const completedBookings = await prisma.booking.findMany({
      where: bookingWhere,
      include: { service: true, serviceRequest: true },
    })

    const payments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { id: true, userId: true, referenceId: true },
    })

    for (const b of completedBookings) {
      const alreadyPaid = payments.some(
        (p) =>
          p.userId === b.userId &&
          (p.referenceId === b.service.title ||
            p.referenceId === b.serviceId ||
            p.referenceId === b.id ||
            (b.serviceRequestId && p.referenceId === b.serviceRequestId))
      )

      if (!alreadyPaid && b.service?.price) {
        const gross = b.service.price
        const commissionRate = 10
        const commissionAmount = (gross * commissionRate) / 100
        const netAmount = gross - commissionAmount
        const txRef = `ICSS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

        await prisma.payment.create({
          data: {
            userId: b.userId,
            amount: gross,
            paymentType: 'SERVICE',
            referenceId: b.service.title,
            status: 'SUCCESS',
            transactionRef: txRef,
            transaction: {
              create: {
                grossAmount: gross,
                commissionRate,
                commissionAmount,
                netAmount,
              },
            },
          },
        })
      }
    }

    // Also check completed service requests
    const requestWhere = targetUserId
      ? { userId: targetUserId, status: 'COMPLETED' }
      : { status: 'COMPLETED' }

    const completedRequests = await prisma.serviceRequest.findMany({
      where: requestWhere,
      include: { service: true },
    })

    const updatedPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      select: { id: true, userId: true, referenceId: true },
    })

    for (const req of completedRequests) {
      const alreadyPaid = updatedPayments.some(
        (p) =>
          p.userId === req.userId &&
          (p.referenceId === req.service.title ||
            p.referenceId === req.serviceId ||
            p.referenceId === req.id)
      )

      if (!alreadyPaid && req.service?.price) {
        const gross = req.service.price
        const commissionRate = 10
        const commissionAmount = (gross * commissionRate) / 100
        const netAmount = gross - commissionAmount
        const txRef = `ICSS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

        await prisma.payment.create({
          data: {
            userId: req.userId,
            amount: gross,
            paymentType: 'SERVICE',
            referenceId: req.service.title,
            status: 'SUCCESS',
            transactionRef: txRef,
            transaction: {
              create: {
                grossAmount: gross,
                commissionRate,
                commissionAmount,
                netAmount,
              },
            },
          },
        })
      }
    }
  } catch (err) {
    console.error('Error during auto-sync of completed payments:', err)
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Run auto-sync for missing completed booking/service payments
    await syncCompletedPayments(user.role === 'ADMIN' ? undefined : user.id)

    const where = user.role === 'ADMIN' ? {} : { userId: user.id }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        transaction: true,
        user: { select: { id: true, name: true, email: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: payments })
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, paymentType, referenceId, serviceRequestId } = body

    if (!amount || !paymentType) {
      return NextResponse.json(
        { success: false, error: 'Amount and payment type are required' },
        { status: 400 }
      )
    }

    const gross = parseFloat(amount)
    if (isNaN(gross) || gross <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 })
    }

    // Platform commission rate: 10%
    const commissionRate = 10
    const commissionAmount = (gross * commissionRate) / 100
    const netAmount = gross - commissionAmount
    const txRef = `ICSS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

    // Create payment with linked transaction in a single atomic record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: gross,
        paymentType: paymentType.toUpperCase(),
        referenceId: referenceId || serviceRequestId || null,
        status: 'SUCCESS',
        transactionRef: txRef,
        transaction: {
          create: {
            grossAmount: gross,
            commissionRate,
            commissionAmount,
            netAmount,
          },
        },
      },
      include: {
        transaction: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })

    // If payment was for a service request, also create a user notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'تم تسجيل الدفع بنجاح',
          message: `تم تسديد مبلغ ${gross.toLocaleString()} دج بنجاح لمعاملة (${txRef}). تم إصدار الفاتورة الرسمية.`,
          type: 'PAYMENT',
        },
      })
    } catch {
      // Non-critical notification failure
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process payment' },
      { status: 500 }
    )
  }
}

