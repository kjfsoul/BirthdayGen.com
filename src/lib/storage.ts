import { supabase } from './supabase/client'

export async function uploadUserImage(file: File) {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
        throw new Error('Please sign in to upload images')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)

    return publicUrl
}
