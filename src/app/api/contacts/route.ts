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
      where: { user_id: userId },
      include: {
        cards: {
          orderBy: { created_at: 'desc' }
        },
        gift_recommendations: {
          orderBy: { created_at: 'desc' }
        }
      },
      orderBy: { created_at: 'desc' }
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
        user_id: userId,
        first_name: firstName,
        last_name: lastName || null,
        email: email || null,
        phone: phone || null,
        birthday_date: birthdayDate,
        birthday_year: birthdayYear || null,
        relationship: relationship || null,
        notes: notes || null
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