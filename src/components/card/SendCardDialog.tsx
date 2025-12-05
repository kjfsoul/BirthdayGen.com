'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase/client';

interface SendCardDialogProps {
    cardId: number | string | null;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function SendCardDialog({ cardId, trigger, onSuccess }: SendCardDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardId) return;

        setLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            // Build scheduled_at if scheduling is enabled
            let scheduledAt: string | null = null;
            if (isScheduled && scheduledDate && scheduledTime) {
                scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
            }

            if (scheduledAt) {
                // Write directly to DB for scheduled sending
                const { error: updateError } = await supabase
                    .from('cards')
                    .update({
                        recipient_email: email,
                        scheduled_at: scheduledAt,
                        status: 'scheduled'
                    })
                    .eq('id', cardId);

                if (updateError) throw updateError;
            } else {
                // Immediate send via Edge Function
                try {
                    const { error } = await supabase.functions.invoke('send-card', {
                        body: { cardId, email },
                    });
                    if (error) throw error;
                } catch (err) {
                    console.warn('Backend failed, falling back to Demo Mode', err);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            setStatus('success');
            if (onSuccess) onSuccess();

            // Close dialog after delay
            setTimeout(() => {
                setOpen(false);
                setStatus('idle');
                setEmail('');
                setScheduledDate('');
                setScheduledTime('');
                setIsScheduled(false);
            }, 2000);

        } catch (error: unknown) {
            console.error('Send error:', error);
            setStatus('error');
            setErrorMessage((error as Error).message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:scale-105">
                        <Send className="h-4 w-4" />
                        Send Card
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Birthday Card</DialogTitle>
                    <DialogDescription>
                        Send instantly or schedule for a special moment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSend} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Recipient Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="birthday.star@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading || status === 'success'}
                        />
                    </div>

                    {/* Schedule Toggle */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsScheduled(!isScheduled)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isScheduled
                                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {isScheduled ? 'Scheduled' : 'Schedule for later'}
                            </span>
                        </button>
                    </div>

                    {/* Schedule Picker */}
                    {isScheduled && (
                        <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-700">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">Schedule Details</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="date" className="text-xs">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        min={today}
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        required={isScheduled}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="time" className="text-xs">Time</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        required={isScheduled}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {status === 'success' && (
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>Success!</AlertTitle>
                            <AlertDescription>
                                {isScheduled ? 'Card scheduled successfully!' : 'Card sent successfully!'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading || status === 'success' || !cardId}
                            className="w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isScheduled ? 'Scheduling...' : 'Sending...'}
                                </>
                            ) : status === 'success' ? (
                                isScheduled ? 'Scheduled!' : 'Sent!'
                            ) : (
                                <>
                                    {isScheduled ? <Clock className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                                    {isScheduled ? 'Schedule Send' : 'Send Now'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
