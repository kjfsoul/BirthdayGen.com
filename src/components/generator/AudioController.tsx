import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Music, Play, Pause, Volume2 } from 'lucide-react'

interface Track {
    id: string
    name: string
    url: string
    duration: string
}

interface AudioControllerProps {
    onSelectTrack?: (url: string) => void
    autoPlayInPreview?: boolean
}

const PRESET_TRACKS: Track[] = [
    {
        id: 'celebration',
        name: 'Birthday Celebration',
        url: '/sounds/celebration.mp3',
        duration: '0:15'
    },
    {
        id: 'party',
        name: 'Party Vibes',
        url: '/sounds/party.mp3',
        duration: '0:15'
    },
    {
        id: 'classic',
        name: 'Happy Birthday Classic',
        url: '/sounds/happy-birthday.mp3',
        duration: '0:15'
    }
]

export function AudioController({ onSelectTrack, autoPlayInPreview = false }: AudioControllerProps) {
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Cleanup audio on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    const handlePlayPreview = (track: Track) => {
        // Stop current track if playing
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }

        // If clicking the same playing track, just stop it
        if (playingTrackId === track.id) {
            setPlayingTrackId(null)
            return
        }

        // Play new track
        const audio = new Audio(track.url)
        audio.volume = 0.5

        audio.addEventListener('ended', () => {
            setPlayingTrackId(null)
        })

        audio.addEventListener('error', () => {
            console.error('Audio playback error for track:', track.name)
            setPlayingTrackId(null)
        })

        audio.play().catch((error) => {
            console.error('Audio play blocked:', error)
            setPlayingTrackId(null)
        })

        audioRef.current = audio
        setPlayingTrackId(track.id)
    }

    const handleSelectTrack = (track: Track) => {
        setSelectedTrackId(track.id)
        onSelectTrack?.(track.url)

        // Auto-play if in preview mode and allowed
        if (autoPlayInPreview) {
            handlePlayPreview(track)
        }
    }

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                    <Music className="h-5 w-5 mr-2 text-blue-500" />
                    Background Music
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Add a soundtrack to your card
                </p>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[280px]">
                    <div className="space-y-2">
                        {PRESET_TRACKS.map((track) => (
                            <div
                                key={track.id}
                                className={`p-3 rounded-lg border-2 transition-all ${selectedTrackId === track.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-100 hover:border-purple-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{track.name}</h4>
                                        <p className="text-xs text-muted-foreground">{track.duration}</p>
                                    </div>
                                    {selectedTrackId === track.id && (
                                        <Badge className="bg-purple-500 text-white text-xs">
                                            Selected
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handlePlayPreview(track)}
                                    >
                                        {playingTrackId === track.id ? (
                                            <>
                                                <Pause className="h-3 w-3 mr-1" />
                                                Stop
                                            </>
                                        ) : (
                                            <>
                                                <Play className="h-3 w-3 mr-1" />
                                                Preview
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={`flex-1 ${selectedTrackId === track.id
                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                : ''
                                            }`}
                                        onClick={() => handleSelectTrack(track)}
                                    >
                                        <Volume2 className="h-3 w-3 mr-1" />
                                        {selectedTrackId === track.id ? 'Selected' : 'Select'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        💡 <strong>Tip:</strong> Music will play when the recipient opens your card (browser permitting).
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
