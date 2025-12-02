import React from 'react';
import { GiftGrid } from '@/components/gifts/GiftGrid';
import { AIGiftFinder } from '@/components/gifts/AIGiftFinder';
import { Gift } from 'lucide-react';

// Mock data for MVP
const FEATURED_GIFTS = [
  {
    id: 1,
    title: "Aura Crystal Set",
    description: "Balance your energy with this curated set of healing crystals.",
    image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
    price: 45.00,
    buy_url: "#",
    category: "Wellness",
    featured: true
  },
  {
    id: 2,
    title: "Custom Star Map",
    description: "A beautiful print of the night sky on their special day.",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop",
    price: 60.00,
    buy_url: "#",
    category: "Decor",
    featured: true
  },
  {
    id: 3,
    title: "Aromatherapy Diffuser",
    description: "Fill their home with calming scents and soft light.",
    image_url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=2070&auto=format&fit=crop",
    price: 35.00,
    buy_url: "#",
    category: "Wellness",
    featured: true
  },
  {
    id: 4,
    title: "Gourmet Chocolate Box",
    description: "Handcrafted chocolates for the sweet tooth.",
    image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=2070&auto=format&fit=crop",
    price: 25.00,
    buy_url: "#",
    category: "Food",
    featured: true
  }
];

export default function GiftGuidePage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="relative bg-purple-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2807&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/90"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <Gift className="h-6 w-6 mr-2 text-pink-300" />
            <span className="font-medium text-pink-100">The Ultimate Gift Guide</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Perfect Gift</span>
            <br /> for Every Aura
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Stop guessing. Use our AI-powered engine to discover personalized gifts based on personality, interests, and relationship.
          </p>
        </div>
      </section>

      {/* AI Finder Section */}
      <section className="container mx-auto px-4 -mt-10 relative z-20 mb-20">
        <AIGiftFinder />
      </section>

      {/* Featured Gifts Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Trending Gifts</h2>
        </div>

        <GiftGrid gifts={FEATURED_GIFTS} />
      </section>
    </main>
  );
}
