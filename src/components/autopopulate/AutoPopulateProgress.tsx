'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, AlertCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type EnrichmentStatus = 'idle' | 'running' | 'complete' | 'error';

interface AutoPopulateProgressProps {
  status: EnrichmentStatus;
  progress: number; // 0-100
  totalContacts: number;
  processedContacts: number;
  successCount: number;
  errorCount: number;
  currentContact?: string;
  errorMessage?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
}

/**
 * AutoPopulateProgress - Display enrichment progress states
 * 
 * States:
 * - idle: Waiting to start
 * - running: Processing with progress bar
 * - complete: Success with stats
 * - error: Error state with retry option
 * 
 * Features:
 * - Real-time progress tracking
 * - Contact count and status display
 * - Cancel/retry functionality
 * - Visual status indicators
 */
export function AutoPopulateProgress({
  status,
  progress,
  totalContacts,
  processedContacts,
  successCount,
  errorCount,
  currentContact,
  errorMessage,
  onCancel,
  onRetry,
  onClose,
}: AutoPopulateProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for elapsed time
  useEffect(() => {
    if (status !== 'running') {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'idle':
      default:
        return <AlertCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'running':
        return 'Enriching Contacts...';
      case 'complete':
        return 'Enrichment Complete!';
      case 'error':
        return 'Enrichment Failed';
      case 'idle':
      default:
        return 'Ready to Enrich';
    }
  };

  if (status === 'idle') {
    return null; // Don't show anything when idle
  }

  return (
    <Card className="w-full border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <CardTitle className="text-xl">{getStatusTitle()}</CardTitle>
          </div>
          {status !== 'running' && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {status === 'running' && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{processedContacts} / {totalContacts} contacts</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Current Contact */}
        {status === 'running' && currentContact && (
          <div className="text-sm text-muted-foreground">
            Processing: <span className="font-medium text-foreground">{currentContact}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <span className="text-xs text-muted-foreground">Total:</span>
            <span className="font-semibold">{totalContacts}</span>
          </Badge>
          
          {(status === 'running' || status === 'complete' || status === 'error') && (
            <>
              <Badge variant="default" className="gap-1 bg-green-500">
                <CheckCircle className="h-3 w-3" />
                <span className="font-semibold">{successCount}</span>
              </Badge>
              
              {errorCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  <span className="font-semibold">{errorCount}</span>
                </Badge>
              )}
            </>
          )}

          {status === 'running' && (
            <Badge variant="secondary" className="gap-1">
              <span className="text-xs text-muted-foreground">Time:</span>
              <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
            </Badge>
          )}
        </div>

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {status === 'running' && onCancel && (
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
          )}
          
          {status === 'error' && onRetry && (
            <Button onClick={onRetry} size="sm">
              Retry
            </Button>
          )}
          
          {status === 'complete' && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ {successCount} contacts successfully enriched
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
