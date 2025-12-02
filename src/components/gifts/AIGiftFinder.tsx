'use client';

import React, { useState } from 'react';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { GiftGrid } from './GiftGrid';
import { supabase } from '@/lib/supabase/client';

export function AIGiftFinder() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        recipientName: '',
        relationship: '',
        occasion: 'birthday',
        budget: [50],
        interests: '',
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResults([]);

        try {
            // In a real implementation, this would call the API
            // const response = await fetch('/api/gift-recommendations', { ... });
            // const data = await response.json();

            // For now, we'll simulate a delay and return some mock results or fetch from our seeded DB via an API
            // Since we don't have the full API wired up to the DB yet, let's just show a loading state
            // and then "No results" or some mock data if we want to demonstrate the UI.

            // Let's actually try to fetch from the API we just built?
            // Wait, the API I built was `/api/generate` for TEXT content.
            // The gift recommendation API is `/api/gift-recommendations` which exists but mocks external APIs.

            // ... inside component
            const { data, error } = await supabase.functions.invoke('gift-recommendations', {
                body: {
                    recipient: {
                        name: formData.recipientName,
                        relationship: formData.relationship,
                        interests: formData.interests.split(',').map(s => s.trim()),
                    },
                    occasion: formData.occasion,
                    budget: { min: 0, max: formData.budget[0] },
                },
            });

            if (error) throw error;

            // const data = await response.json(); // Removed
            if (data.success && data.recommendations) {
                // Transform recommendations to match GiftGrid format
                // Note: The API returns 'products' which might be empty if APIs aren't configured.
                // We need to handle that.
                const mappedResults = data.recommendations.flatMap((rec: any) =>
                    rec.products.map((prod: any) => ({
                        id: Math.random(), // Temp ID
                        title: prod.name,
                        description: prod.description,
                        image_url: prod.imageUrl,
                        price: prod.price,
                        buy_url: prod.productUrl,
                        category: prod.category,
                        featured: false,
                    }))
                );
                setResults(mappedResults);
            }

        } catch (error) {
            console.error('Error finding gifts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <Card className="w-full max-w-4xl mx-auto border-2 border-purple-100 shadow-xl bg-gradient-to-br from-white to-purple-50/50">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit mb-4">
                        <Sparkles className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                        AI Gift Finder
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Tell us who you're shopping for, and we'll find the perfect match.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="recipientName">Who is this for?</Label>
                                <Input
                                    id="recipientName"
                                    placeholder="e.g. Mom, Charlie, Sarah"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="relationship">Relationship</Label>
                                <Select
                                    value={formData.relationship}
                                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="family">Family</SelectItem>
                                        <SelectItem value="partner">Partner</SelectItem>
                                        <SelectItem value="coworker">Coworker</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="occasion">Occasion</Label>
                                <Select
                                    value={formData.occasion}
                                    onValueChange={(value) => setFormData({ ...formData, occasion: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select occasion" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="birthday">Birthday</SelectItem>
                                        <SelectItem value="anniversary">Anniversary</SelectItem>
                                        <SelectItem value="holiday">Holiday</SelectItem>
                                        <SelectItem value="thank_you">Thank You</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Max Budget: ${formData.budget[0]}</Label>
                                <Slider
                                    value={formData.budget}
                                    onValueChange={(value) => setFormData({ ...formData, budget: value })}
                                    max={500}
                                    step={10}
                                    className="py-4"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="interests">Interests & Hobbies (Optional)</Label>
                            <Input
                                id="interests"
                                placeholder="e.g. gardening, tech, cooking, yoga"
                                value={formData.interests}
                                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing Aura & Finding Gifts...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-5 w-5" />
                                    Find Perfect Gifts
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {results.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <GiftGrid gifts={results} title="AI Recommended for You" />
                </div>
            )}
        </div>
    );
}
