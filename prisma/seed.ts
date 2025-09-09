import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create card templates
  const templates = await Promise.all([
    prisma.cardTemplate.create({
      data: {
        name: 'Birthday Blast',
        description: 'Vibrant and explosive birthday celebration',
        category: 'birthday',
        config: JSON.stringify({
          gradient: 'from-pink-500 to-purple-600',
          animation: 'bounce',
          particles: true
        })
      }
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Elegant Wishes',
        description: 'Sophisticated and classy birthday greeting',
        category: 'birthday',
        config: JSON.stringify({
          gradient: 'from-rose-500 to-pink-600',
          animation: 'fade',
          particles: false
        })
      }
    }),
    prisma.cardTemplate.create({
      data: {
        name: 'Holiday Cheer',
        description: 'Festive holiday celebration card',
        category: 'holiday',
        config: JSON.stringify({
          gradient: 'from-red-500 to-green-600',
          animation: 'sparkle',
          particles: true
        })
      }
    })
  ])

  // Create holidays
  const holidays = await Promise.all([
    prisma.holiday.create({
      data: {
        name: "New Year's Day",
        date: new Date('2000-01-01'), // Year doesn't matter for recurring
        category: 'holiday',
        isRecurring: true
      }
    }),
    prisma.holiday.create({
      data: {
        name: "Valentine's Day",
        date: new Date('2000-02-14'),
        category: 'holiday',
        isRecurring: true
      }
    }),
    prisma.holiday.create({
      data: {
        name: "Mother's Day",
        date: new Date('2000-05-11'), // 2024 date, will be calculated dynamically
        category: 'holiday',
        isRecurring: true
      }
    }),
    prisma.holiday.create({
      data: {
        name: "Father's Day",
        date: new Date('2000-06-16'), // 2024 date, will be calculated dynamically
        category: 'holiday',
        isRecurring: true
      }
    }),
    prisma.holiday.create({
      data: {
        name: "Christmas",
        date: new Date('2000-12-25'),
        category: 'holiday',
        isRecurring: true
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`📝 Created ${templates.length} card templates`)
  console.log(`🎉 Created ${holidays.length} holidays`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })