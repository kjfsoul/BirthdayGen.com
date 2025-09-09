import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const q = searchParams.get('q');
    const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean) || [];
    const month = searchParams.get('month');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    // Search filter
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { emails: { hasSome: [q] } },
      ];
    }

    // Category filter
    if (categoryIds.length > 0) {
      where.categoryIds = {
        hasSome: categoryIds,
      };
    }

    // Month filter
    if (month) {
      const monthNum = parseInt(month);
      if (monthNum >= 1 && monthNum <= 12) {
        where.birthday = {
          not: null,
          gte: new Date(new Date().getFullYear(), monthNum - 1, 1),
          lt: new Date(new Date().getFullYear(), monthNum, 1),
        };
      }
    }

    const [contacts, total] = await Promise.all([
      db.contact.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: limit,
      }),
      db.contact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error searching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to search contacts' },
      { status: 500 }
    );
  }
}
