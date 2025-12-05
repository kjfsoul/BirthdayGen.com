import React, { useState } from 'react';
import { searchPexels, PexelsPhoto } from '@/lib/pexels';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PexelsSearchProps {
    onSelectImage: (url: string, alt: string) => void;
}

export function PexelsSearch({ onSelectImage }: PexelsSearchProps) {
    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const data = await searchPexels(query);
            setPhotos(data.photos || []);
        } catch {
            setError('Failed to fetch images. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    placeholder="Search photos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={loading} size="icon">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </form>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <ScrollArea className="flex-1 h-[400px]">
                {photos.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                        <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                        <p>Search for high-quality images</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 pb-4">
                        {photos.map((photo) => (
                            <Card
                                key={photo.id}
                                className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group relative"
                                onClick={() => onSelectImage(photo.src.large, photo.alt)}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={photo.src.medium}
                                    alt={photo.alt}
                                    className="w-full h-32 object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs p-2 text-center">
                                    by {photo.photographer}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
