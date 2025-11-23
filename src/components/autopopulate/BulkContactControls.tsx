'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  Save,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { EnrichedContact } from '@/lib/autopopulate/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface BulkContactControlsProps {
  enrichedContacts: EnrichedContact[];
  selectedContactIds?: number[];
  onAcceptAll?: () => Promise<void>;
  onRejectAll?: () => Promise<void>;
  onSaveToDatabase?: (contacts: EnrichedContact[]) => Promise<void>;
  onReset?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * BulkContactControls - Bulk operations for enriched contacts
 * 
 * Features:
 * - Bulk accept all enriched data
 * - Bulk reject all enriched data
 * - Save to database with conflict resolution
 * - Reset/clear operations
 * - Confirmation dialogs for destructive actions
 * - Loading states
 * - Success/error feedback
 */
export function BulkContactControls({
  enrichedContacts,
  selectedContactIds,
  onAcceptAll,
  onRejectAll,
  onSaveToDatabase,
  onReset,
  disabled = false,
  className = '',
}: BulkContactControlsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const selectedContacts = selectedContactIds
    ? enrichedContacts.filter((c) => c.id && selectedContactIds.includes(c.id))
    : enrichedContacts;

  const highConfidenceCount = selectedContacts.filter(
    (c) => c.enrichmentMetadata.confidence.overall >= 80
  ).length;

  const mediumConfidenceCount = selectedContacts.filter(
    (c) =>
      c.enrichmentMetadata.confidence.overall >= 60 &&
      c.enrichmentMetadata.confidence.overall < 80
  ).length;

  const lowConfidenceCount = selectedContacts.filter(
    (c) => c.enrichmentMetadata.confidence.overall < 60
  ).length;

  const handleAcceptAll = async () => {
    try {
      setShowAcceptDialog(false);
      await onAcceptAll?.();
      toast.success(`Accepted ${selectedContacts.length} enriched contacts`);
    } catch (error) {
      toast.error('Failed to accept contacts');
      console.error(error);
    }
  };

  const handleRejectAll = async () => {
    try {
      setShowRejectDialog(false);
      await onRejectAll?.();
      toast.success(`Rejected ${selectedContacts.length} enriched contacts`);
    } catch (error) {
      toast.error('Failed to reject contacts');
      console.error(error);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!onSaveToDatabase) return;

    try {
      setIsSaving(true);

      // Save enriched data to database
      await onSaveToDatabase(selectedContacts);

      toast.success(
        `Successfully saved ${selectedContacts.length} enriched contacts to database!`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save contacts';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (enrichedContacts.length === 0) {
    return null;
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Summary */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="font-semibold">{selectedContacts.length}</span>
            </Badge>
            
            {highConfidenceCount > 0 && (
              <Badge variant="default" className="gap-1 bg-green-500">
                <CheckCircle className="h-3 w-3" />
                <span className="font-semibold">{highConfidenceCount}</span>
                <span className="text-xs">High</span>
              </Badge>
            )}
            
            {mediumConfidenceCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span className="font-semibold">{mediumConfidenceCount}</span>
                <span className="text-xs">Medium</span>
              </Badge>
            )}
            
            {lowConfidenceCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                <span className="font-semibold">{lowConfidenceCount}</span>
                <span className="text-xs">Low</span>
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Accept All */}
            {onAcceptAll && (
              <Button
                variant="default"
                onClick={() => setShowAcceptDialog(true)}
                disabled={disabled || selectedContacts.length === 0}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Accept All
              </Button>
            )}

            {/* Reject All */}
            {onRejectAll && (
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={disabled || selectedContacts.length === 0}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject All
              </Button>
            )}

            {/* Save to Database */}
            {onSaveToDatabase && (
              <Button
                variant="default"
                onClick={handleSaveToDatabase}
                disabled={disabled || isSaving || selectedContacts.length === 0}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save to DB
                  </>
                )}
              </Button>
            )}

            {/* Reset */}
            {onReset && (
              <Button
                variant="ghost"
                onClick={onReset}
                disabled={disabled || selectedContacts.length === 0}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Warning for Low Confidence */}
          {lowConfidenceCount > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>{lowConfidenceCount}</strong> contact{lowConfidenceCount > 1 ? 's have' : ' has'}{' '}
                low confidence scores (&lt;60%). Please review before accepting.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept All Confirmation Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept All Enriched Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will accept all enriched data for {selectedContacts.length} contacts, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Predicted birthdays</li>
                <li>Inferred relationships</li>
                <li>Archetype tags</li>
                <li>Gifting profiles</li>
              </ul>
              {lowConfidenceCount > 0 && (
                <div className="mt-3 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Warning:</strong> {lowConfidenceCount} contact
                  {lowConfidenceCount > 1 ? 's have' : ' has'} low confidence scores.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptAll}>Accept All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject All Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject All Enriched Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all enriched data for {selectedContacts.length} contacts. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectAll}
              className="bg-destructive text-destructive-foreground"
            >
              Reject All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
