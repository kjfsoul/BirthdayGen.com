import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Music, Play, Pause, Volume2, ExternalLink } from 'lucide-react'

interface Track {
    id: string
    name: string
    url: string
    duration: string
    artist: string
    source: string
}

interface AudioControllerProps {
    onSelectTrack?: (url: string) => void
    autoPlayInPreview?: boolean
}

// Real royalty-free tracks from Internet Archive and free sources
const PRESET_TRACKS: Track[] = [
    {
        id: 'happy-birthday-jazz',
        name: 'Happy Birthday Jazz',
        url: 'https://ia800201.us.archive.org/29/items/HappyBirthdayToYou_655/HappyBirthdayToYou.mp3',
        duration: '0:28',
        artist: 'Public Domain',
        source: 'Internet Archive'
    },
    {
        id: 'celebration-fanfare',
        name: 'Celebration Fanfare',
        url: 'https://freesound.org/data/previews/270/270402_5123851-lq.mp3',
        duration: '0:08',
        artist: 'Freesound',
        source: 'Freesound.org'
    },
    {
        id: 'party-horn',
        name: 'Party Horns',
        url: 'https://freesound.org/data/previews/397/397353_4284968-lq.mp3',
        duration: '0:03',
        artist: 'Freesound',
        source: 'Freesound.org'
    },
    {
        id: 'upbeat-celebration',
        name: 'Upbeat Celebration',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1718ab41b.mp3',
        duration: '0:30',
        artist: 'Pixabay',
        source: 'Pixabay Music'
    },
    {
        id: 'happy-claps',
        name: 'Happy Clapping',
        url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3',
        duration: '0:15',
        artist: 'Pixabay',
        source: 'Pixabay Music'
    }
]

export function AudioController({ onSelectTrack, autoPlayInPreview = false }: AudioControllerProps) {
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
    const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    const handlePlayPreview = (track: Track) => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }

        if (playingTrackId === track.id) {
            setPlayingTrackId(null)
            return
        }

        setLoadingTrackId(track.id)
        const audio = new Audio(track.url)
        audio.volume = 0.5
        audio.crossOrigin = 'anonymous'

        audio.addEventListener('canplaythrough', () => {
            setLoadingTrackId(null)
        })

        audio.addEventListener('ended', () => {
            setPlayingTrackId(null)
        })

        audio.addEventListener('error', () => {
            console.error('Audio playback error for track:', track.name)
            setPlayingTrackId(null)
            setLoadingTrackId(null)
        })

        audio.play().catch((error) => {
            console.error('Audio play blocked:', error)
            setPlayingTrackId(null)
            setLoadingTrackId(null)
        })

        audioRef.current = audio
        setPlayingTrackId(track.id)
    }

    const handleSelectTrack = (track: Track) => {
        setSelectedTrackId(track.id)
        onSelectTrack?.(track.url)

        if (autoPlayInPreview) {
            handlePlayPreview(track)
        }
    }

    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3 px-0 pt-0">
                <CardTitle className="flex items-center text-base">
                    <Music className="h-4 w-4 mr-2 text-purple-500" />
                    Background Music
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Add a soundtrack to your card
                </p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                        {PRESET_TRACKS.map((track) => (
                            <div
                                key={track.id}
                                className={`p-3 rounded-lg border-2 transition-all ${selectedTrackId === track.id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-100 hover:border-purple-200 bg-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{track.name}</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            {track.duration} • {track.artist}
                                        </p>
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
                                        className="flex-1 h-8"
                                        onClick={() => handlePlayPreview(track)}
                                        disabled={loadingTrackId === track.id}
                                    >
                                        {loadingTrackId === track.id ? (
                                            <span className="animate-pulse">Loading...</span>
                                        ) : playingTrackId === track.id ? (
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
                                        className={`flex-1 h-8 ${selectedTrackId === track.id
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

                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg">
                    <p className="text-xs text-purple-800">
                        🎵 <strong>Note:</strong> Music plays when your card is opened. All tracks are royalty-free.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
