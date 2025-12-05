import { supabase } from './supabase/client'

export interface VaultImage {
    id: number
    url: string
    alt: string
    source: string
    source_id: string
    created_at: string
}

export async function saveToVault(image: { url: string, alt: string, source: string, source_id: string }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
        .from('user_images')
        .insert({
            user_id: user.id,
            url: image.url,
            alt: image.alt,
            source: image.source,
            source_id: image.source_id
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getVaultImages() {
    const { data, error } = await supabase
        .from('user_images')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as VaultImage[]
}
