import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const contacts = await db.contact.findMany({
      where: { userId },
      include: {
        cards: true,
        gift_recommendations: true
      },
      orderBy: { id: 'desc' }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      firstName,
      lastName,
      email,
      phone,
      birthdayDate,
      birthdayYear,
      relationship,
      notes
    } = body

    if (!userId || !firstName || !birthdayDate) {
      return NextResponse.json(
        { error: 'User ID, first name, and birthday date are required' },
        { status: 400 }
      )
    }

    const contact = await db.contact.create({
      data: {
        userId,
        fullName: firstName,
        emails: email ? [email] : [],
        birthday: birthdayDate ? new Date(birthdayDate) : null,
        gender: null,
        social_handles: undefined,
        interests: undefined,
        categoryIds: []
      },
      include: {
        cards: true,
        gift_recommendations: true
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}
