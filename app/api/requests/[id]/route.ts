import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, adminNote } = body

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
      include: { service: true, user: true },
    })

    // If marked as COMPLETED, ensure payment & transaction exist, update linked bookings, and notify user
    if (status === 'COMPLETED' && updated.service?.price) {
      try {
        // Sync any active bookings for this request to COMPLETED
        await prisma.booking.updateMany({
          where: {
            serviceRequestId: updated.id,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          data: { status: 'COMPLETED' },
        })

        // Check if payment already exists
        const existingPayments = await prisma.payment.findMany({
          where: { userId: updated.userId, status: 'SUCCESS' },
          select: { id: true, referenceId: true },
        })

        const alreadyPaid = existingPayments.some(
          (p) =>
            p.referenceId === updated.service.title ||
            p.referenceId === updated.serviceId ||
            p.referenceId === updated.id
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

        await prisma.notification.create({
          data: {
            userId: updated.userId,
            title: 'تم إكمال الخدمة بنجاح',
            message: `تم إكمال خدمة (${updated.service.title}) وإصدار الفاتورة الرسمية. يمكنك تفقد التفاصيل في سجل المدفوعات.`,
            type: 'SUCCESS',
          },
        })
      } catch (err) {
        console.error('Error during post-completion actions for request:', err)
      }
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 })
  }
}
