import { supabase } from '@/lib/supabase/client';

export interface PexelsPhoto {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    alt: string;
}

export interface PexelsResponse {
    total_results: number;
    page: number;
    per_page: number;
    photos: PexelsPhoto[];
    next_page?: string;
}

export async function searchPexels(query: string, page = 1, per_page = 20): Promise<PexelsResponse> {
    const { data, error } = await supabase.functions.invoke('pexels-search', {
        body: { query, page, per_page },
    });

    if (error) {
        console.error('Pexels search error:', error);
        throw error;
    }

    return data;
}
