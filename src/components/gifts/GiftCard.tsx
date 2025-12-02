import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GiftCardProps {
    gift: {
        id: number;
        title: string;
        description: string;
        image_url: string | null;
        price: number;
        buy_url: string;
        category: string;
        featured: boolean;
    };
}

export function GiftCard({ gift }: GiftCardProps) {
    return (
        <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {gift.image_url ? (
                    <img
                        src={gift.image_url}
                        alt={gift.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
                {gift.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                        Featured
                    </Badge>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500"
                >
                    <Heart className="h-5 w-5" />
                </Button>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2 capitalize">
                        {gift.category}
                    </Badge>
                    <span className="font-bold text-lg text-green-600">
                        ${Number(gift.price).toFixed(2)}
                    </span>
                </div>
                <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                    {gift.title}
                </h3>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-gray-500 line-clamp-3">
                    {gift.description}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button className="w-full gap-2" asChild>
                    <a href={gift.buy_url} target="_blank" rel="noopener noreferrer">
                        View Deal <ExternalLink className="h-4 w-4" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}
