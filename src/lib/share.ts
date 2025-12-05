import { toPng } from 'html-to-image';

/**
 * Share the card as a PNG image using Web Share API or fallback to download.
 * Uses CORS settings for cross-origin image support.
 *
 * @param cardStageId - The DOM ID of the card element to capture (default: 'card-stage')
 * @param fileName - The filename for the shared/downloaded image
 */
export async function handleShare(
    cardStageId: string = 'card-stage',
    fileName: string = 'birthday-card.png'
): Promise<{ success: boolean; method: 'share' | 'download' | 'error'; error?: string }> {
    const cardStage = document.getElementById(cardStageId);

    if (!cardStage) {
        return {
            success: false,
            method: 'error',
            error: `Element with id '${cardStageId}' not found`
        };
    }

    try {
        // Convert the card to PNG with CORS settings
        const dataUrl = await toPng(cardStage, {
            cacheBust: true,
            quality: 0.95,
            pixelRatio: 2, // Higher resolution for better quality
            skipFonts: false,
            includeQueryParams: true, // Help with CORS
        });

        // Convert data URL to Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Create a File object for sharing
        const file = new File([blob], fileName, { type: 'image/png' });

        // Try native sharing (works on mobile and some desktop browsers)
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Birthday Card',
                text: 'Check out this birthday card I made!',
            });
            return { success: true, method: 'share' };
        }

        // Fallback: Download the image
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true, method: 'download' };

    } catch (error) {
        console.error('Share failed:', error);
        return {
            success: false,
            method: 'error',
            error: (error as Error).message
        };
    }
}

/**
 * Check if native sharing with files is supported
 */
export function canShareFiles(): boolean {
    if (typeof navigator === 'undefined') return false;
    if (!navigator.share) return false;

    // Test with a dummy file
    try {
        const testFile = new File(['test'], 'test.png', { type: 'image/png' });
        return navigator.canShare?.({ files: [testFile] }) ?? false;
    } catch {
        return false;
    }
}
