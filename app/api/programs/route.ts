import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ success: true, data: programs })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch programs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, price, duration, level, sessions } = body

    if (!title || !description || price === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const program = await prisma.program.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        duration: duration || '6 weeks',
        level: level || 'All Levels',
        sessions: parseInt(sessions) || 6,
      },
    })

    return NextResponse.json({ success: true, data: program }, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json({ success: false, error: 'Failed to create program' }, { status: 500 })
  }
}
