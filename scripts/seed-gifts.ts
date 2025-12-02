import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_GIFTS = [
    {
        title: "Noise Cancelling Headphones",
        description: "Premium wireless headphones with active noise cancellation for deep focus or relaxation.",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        price: 299.99,
        buy_url: "https://amazon.com",
        category: "tech",
        aura_types: ["tech", "zen", "music"],
        recipient_types: ["partner", "friend", "family"],
        featured: true,
    },
    {
        title: "Artisan Coffee Subscription",
        description: "Monthly delivery of freshly roasted beans from top micro-roasters around the world.",
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
        price: 24.99,
        buy_url: "https://bluebottlecoffee.com",
        category: "food",
        aura_types: ["foodie", "cozy"],
        recipient_types: ["friend", "coworker", "family"],
        featured: true,
    },
    {
        title: "Smart Garden",
        description: "Indoor hydroponic garden for growing fresh herbs and vegetables year-round.",
        image_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
        price: 99.95,
        buy_url: "https://clickandgrow.com",
        category: "home_decor",
        aura_types: ["zen", "foodie", "eco_friendly"],
        recipient_types: ["family", "partner"],
        featured: false,
    },
    {
        title: "Weighted Blanket",
        description: "Luxurious weighted blanket for reducing anxiety and improving sleep quality.",
        image_url: "https://images.unsplash.com/photo-1580301762395-9c64265e9c5d?w=800&q=80",
        price: 129.00,
        buy_url: "https://bearaby.com",
        category: "wellness",
        aura_types: ["cozy", "zen"],
        recipient_types: ["partner", "family", "friend"],
        featured: true,
    },
    {
        title: "Vintage Vinyl Record Player",
        description: "Portable suitcase turntable with built-in speakers and Bluetooth.",
        image_url: "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?w=800&q=80",
        price: 69.99,
        buy_url: "https://amazon.com",
        category: "music",
        aura_types: ["vintage", "music", "artsy"],
        recipient_types: ["friend", "partner"],
        featured: false,
    },
    {
        title: "Kindle Paperwhite",
        description: "Waterproof e-reader with adjustable warm light for reading anywhere.",
        image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
        price: 139.99,
        buy_url: "https://amazon.com",
        category: "tech",
        aura_types: ["tech", "books", "travel"],
        recipient_types: ["partner", "family", "friend"],
        featured: true,
    },
    {
        title: "Mixology Bartender Kit",
        description: "Complete set of bar tools for crafting professional cocktails at home.",
        image_url: "https://images.unsplash.com/photo-1574048318681-5b9b799a6330?w=800&q=80",
        price: 45.00,
        buy_url: "https://amazon.com",
        category: "food",
        aura_types: ["foodie", "glam", "social"],
        recipient_types: ["friend", "coworker"],
        featured: false,
    },
    {
        title: "Yoga Mat & Block Set",
        description: "Eco-friendly non-slip yoga mat with cork blocks for practice.",
        image_url: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80",
        price: 65.00,
        buy_url: "https://lululemon.com",
        category: "wellness",
        aura_types: ["zen", "sporty", "eco_friendly"],
        recipient_types: ["friend", "partner"],
        featured: false,
    },
    {
        title: "Custom Star Map",
        description: "Personalized map of the stars from a specific date and location.",
        image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        price: 55.00,
        buy_url: "https://thenightsky.com",
        category: "personalized",
        aura_types: ["cosmic", "sentimental", "romantic"],
        recipient_types: ["partner", "family"],
        featured: true,
    },
    {
        title: "Instax Mini Instant Camera",
        description: "Fun instant camera for capturing memories with credit-card sized prints.",
        image_url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
        price: 76.00,
        buy_url: "https://amazon.com",
        category: "tech",
        aura_types: ["artsy", "vintage", "social"],
        recipient_types: ["friend", "teen"],
        featured: false,
    }
];

async function main() {
    console.log('🌱 Seeding gifts...');

    // Debug: Log available models on Prisma Client
    // Note: Prisma Client properties are often getters, so Object.keys might not show them.
    // But we can try to check if 'gift' exists.
    console.log('Prisma Client keys:', Object.keys(prisma));
    // @ts-ignore
    console.log('Is prisma.gift defined?', !!prisma.gift);
    // @ts-ignore
    console.log('Is prisma.Gift defined?', !!prisma.Gift);

    for (const gift of SAMPLE_GIFTS) {
        // @ts-ignore
        if (prisma.gift) {
            await prisma.gift.create({
                data: gift,
            });
        } else {
            throw new Error("prisma.gift is undefined!");
        }
    }

    console.log(`✅ Seeded ${SAMPLE_GIFTS.length} gifts.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
