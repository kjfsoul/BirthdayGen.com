import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const contactId = searchParams.get('contactId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const whereClause: any = { user_id: userId }
    if (contactId) {
      whereClause.contact_id = parseInt(contactId)
    }

    const cards = await db.card.findMany({
      where: whereClause,
      include: {
        contact: true,
        card_designs: true
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      contactId,
      title,
      message,
      template,
      backgroundStyle,
      textStyle,
      elements,
      status
    } = body

    if (!userId || !title || !message || !template) {
      return NextResponse.json(
        { error: 'User ID, title, message, and template are required' },
        { status: 400 }
      )
    }

    const card = await db.card.create({
      data: {
        user_id: userId,
        contact_id: contactId ? parseInt(contactId) : null,
        title,
        message,
        template,
        background_style: backgroundStyle || 'default',
        text_style: textStyle || 'default',
        elements: elements || [],
        status: status || 'draft'
      },
      include: {
        contact: true,
        card_designs: true
      }
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    )
  }
}