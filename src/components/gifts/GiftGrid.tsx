import React from 'react';
import { GiftCard } from './GiftCard';

interface GiftGridProps {
    gifts: Array<{
        id: number;
        title: string;
        description: string;
        image_url: string | null;
        price: number;
        buy_url: string;
        category: string;
        featured: boolean;
    }>;
    title?: string;
}

export function GiftGrid({ gifts, title }: GiftGridProps) {
    if (gifts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No gifts found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {title && (
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gifts.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} />
                ))}
            </div>
        </div>
    );
}
