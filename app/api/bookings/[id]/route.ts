import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Allowed status transitions — enforced server-side
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    // Load existing booking
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    // Only admin or booking owner can update
    if (user.role !== 'ADMIN' && booking.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Enforce strict status transitions (admin only for status changes)
    if (status && status !== booking.status) {
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Only admins can change booking status' },
          { status: 403 }
        )
      }
      const allowed = ALLOWED_TRANSITIONS[booking.status] ?? []
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid transition: cannot move from "${booking.status}" to "${status}". Allowed: [${allowed.join(', ')}]`,
          },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        service: true,
        user: true,
        serviceRequest: { include: { service: true } },
      },
    })

    // If marked as COMPLETED, ensure payment & transaction exist, update request, and notify user
    if (status === 'COMPLETED' && updated.service?.price) {
      try {
        // 1. Sync linked request to COMPLETED if present
        if (updated.serviceRequestId) {
          await prisma.serviceRequest.update({
            where: { id: updated.serviceRequestId },
            data: { status: 'COMPLETED' },
          })
        }

        // 2. Check if payment already exists
        const existingPayments = await prisma.payment.findMany({
          where: { userId: updated.userId, status: 'SUCCESS' },
          select: { id: true, referenceId: true },
        })

        const alreadyPaid = existingPayments.some(
          (p) =>
            p.referenceId === updated.service.title ||
            p.referenceId === updated.serviceId ||
            p.referenceId === updated.id ||
            (updated.serviceRequestId && p.referenceId === updated.serviceRequestId)
        )

        if (!alreadyPaid) {
          const gross = updated.service.price
          const commissionRate = 10
          const commissionAmount = (gross * commissionRate) / 100
          const netAmount = gross - commissionAmount
          const txRef = `ICSS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`

          await prisma.payment.create({
            data: {
              userId: updated.userId,
              amount: gross,
              paymentType: 'SERVICE',
              referenceId: updated.service.title,
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

        // 3. User notification
        await prisma.notification.create({
          data: {
            userId: updated.userId,
            title: 'تم إكمال الجلسة وإصدار الفاتورة',
            message: `تم إكمال جلسة (${updated.service.title}) بنجاح. يمكنك الآن الاطلاع على الفاتورة الرسمية وتحميلها من سجل المدفوعات.`,
            type: 'SUCCESS',
          },
        })
      } catch (err) {
        console.error('Error during post-completion actions for booking:', err)
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 })
  }
}
