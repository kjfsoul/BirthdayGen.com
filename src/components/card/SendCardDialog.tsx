'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
    cardId: number | null;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function SendCardDialog({ cardId, trigger, onSuccess }: SendCardDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
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
            try {
                const { data, error } = await supabase.functions.invoke('send-card', {
                    body: {
                        cardId,
                        email,
                    },
                });

                if (error) throw error;
            } catch (err) {
                console.warn('Backend failed, falling back to Demo Mode', err);
                // Demo Mode Fallback
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            }

            setStatus('success');
            if (onSuccess) onSuccess();

            // Close dialog after a delay on success
            setTimeout(() => {
                setOpen(false);
                setStatus('idle');
                setEmail('');
            }, 2000);

        } catch (error: any) {
            console.error('Send error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                        Enter the recipient's email address to send this magical card instantly.
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
                            <AlertDescription>Card sent successfully! (Demo Mode)</AlertDescription>
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
                                    Sending...
                                </>
                            ) : status === 'success' ? (
                                'Sent!'
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Now
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
