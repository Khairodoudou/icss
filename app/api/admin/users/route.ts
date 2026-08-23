import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        company: true,
        createdAt: true,
        _count: {
          select: {
            requests: true,
            bookings: true,
            subscriptions: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ success: false, error: 'Unauthorized or failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { userId, status, role } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role === 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin accounts cannot be deleted' },
        { status: 403 }
      )
    }

    // Clean up any transactions linked to user's payments before deletion
    const userPayments = await prisma.payment.findMany({
      where: { userId },
      select: { id: true },
    })
    const paymentIds = userPayments.map((p) => p.id)
    if (paymentIds.length > 0) {
      await prisma.transaction.deleteMany({
        where: { paymentId: { in: paymentIds } },
      })
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 })
  }
}

