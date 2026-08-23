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

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process payment' },
      { status: 500 }
    )
  }
}

