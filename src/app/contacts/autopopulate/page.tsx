/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { AutoPopulateButton } from '@/components/autopopulate/AutoPopulateButton';
import { AutoPopulateProgress, EnrichmentStatus } from '@/components/autopopulate/AutoPopulateProgress';
import { EnrichedContactsDisplay } from '@/components/autopopulate/EnrichedContactsDisplay';
import { BulkContactControls } from '@/components/autopopulate/BulkContactControls';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  InfoIcon,
  Sparkles,
  Shield,
  Brain,
  Gift,
  Calendar,
  Users,
} from 'lucide-react';
import type { EnrichedContact } from '@/lib/autopopulate/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EditContactDialog } from '@/components/autopopulate/EditContactDialog';

/**
 * Auto-Populate Contacts Page
 *
 * Main integration page that composes all auto-populate components:
 * - AutoPopulateButton: Trigger enrichment
 * - AutoPopulateProgress: Show progress
 * - EnrichedContactsDisplay: Display results
 * - BulkContactControls: Bulk operations
 *
 * Features:
 * - Complete enrichment workflow
 * - Error boundaries
 * - Usage instructions
 * - Privacy information
 * - Loading states
 */
export default function AutoPopulatePage() {
  // Enrichment state
  const [status, setStatus] = useState<EnrichmentStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [totalContacts] = useState(0);
  const [processedContacts, setProcessedContacts] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentContact] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [enrichedContacts, setEnrichedContacts] = useState<EnrichedContact[]>([]);
  const [editingContact, setEditingContact] = useState<EnrichedContact | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handlers
  const handleEnrichmentStart = useCallback(() => {
    setStatus('running');
    setProgress(0);
    setProcessedContacts(0);
    setSuccessCount(0);
    setErrorCount(0);
    setErrorMessage(undefined);
    setEnrichedContacts([]);
  }, []);

  const handleEnrichmentComplete = useCallback(async (success: boolean, count: number) => {
    if (success) {
      setStatus('complete');
      setProgress(100);
      setSuccessCount(count);
      setProcessedContacts(count);

      // Fetch enriched results
      try {
        const response = await fetch('/api/contacts');
        if (response.ok) {
          const { contacts } = await response.json();
          // Filter to only show contacts with enrichment metadata
          const enriched = contacts.filter((c: any) => c.enrichmentMetadata);
          setEnrichedContacts(enriched);
        }
      } catch (error) {
        console.error('Failed to fetch enriched contacts:', error);
      }
    } else {
      setStatus('error');
      setErrorCount(count);
    }
  }, []);

  const handleEnrichmentError = useCallback((error: string) => {
    setErrorMessage(error);
    setStatus('error');
  }, []);

  const handleCancel = useCallback(() => {
    setStatus('idle');
    setProgress(0);
  }, []);

  const handleRetry = useCallback(() => {
    setStatus('idle');
    setErrorMessage(undefined);
  }, []);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setEnrichedContacts([]);
    setProcessedContacts(0);
    setSuccessCount(0);
    setErrorCount(0);
  }, []);

  const handleSaveToDatabase = useCallback(async (contacts: EnrichedContact[]) => {
    // Save enriched contacts to database
    const response = await fetch('/api/contacts/bulk-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacts }),
    });

    if (!response.ok) {
      throw new Error('Failed to save contacts to database');
    }

    return response.json();
  }, []);

  const handleAcceptAll = useCallback(async () => {
    // Mark all enriched data as accepted
    setEnrichedContacts(prevContacts =>
      prevContacts.map(contact => {
        const updatedContact = { ...contact };

        // Accept birthday prediction
        if (updatedContact.predictedBirthday) {
          updatedContact.birthday = {
            ...updatedContact.birthday,
            month: updatedContact.predictedBirthday.month,
            day: updatedContact.predictedBirthday.day,
          };
          // Remove prediction metadata as it's now accepted
          delete updatedContact.predictedBirthday;
        }

        // Update confidence to 100% as it is now user-verified
        if (updatedContact.enrichmentMetadata) {
          updatedContact.enrichmentMetadata = {
            ...updatedContact.enrichmentMetadata,
            confidence: {
              ...updatedContact.enrichmentMetadata.confidence,
              overall: 100,
              birthday: 100,
            },
          };
        }

        return updatedContact;
      })
    );
  }, []);

  const handleRejectAll = useCallback(async () => {
    // Discard all enriched data
    setEnrichedContacts([]);
  }, []);

  const handleEditContact = useCallback((contact: EnrichedContact) => {
    setEditingContact(contact);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveContact = useCallback((updatedContact: EnrichedContact) => {
    setEnrichedContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    setIsEditModalOpen(false);
    setEditingContact(null);
  }, []);

  return (
    <main className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Auto-Populate Contacts
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered contact enrichment with birthday predictions, relationship inference, and gifting profiles
          </p>
        </div>
        <Link href="/contacts">
          <Button variant="outline">← Back to Contacts</Button>
        </Link>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            What Gets Enriched
          </CardTitle>
          <CardDescription>
            Our AI analyzes your contacts and intelligently predicts missing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Birthday Prediction */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Birthday Prediction</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Predicts missing birthdays based on social patterns and historical data
                </p>
              </div>
            </div>

            {/* Relationship Inference */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <Users className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Relationship Type</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Infers relationship type (family, friend, colleague) from context
                </p>
              </div>
            </div>

            {/* Archetype Tagging */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <Brain className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Archetype Tags</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tags contacts with personality archetypes and interests
                </p>
              </div>
            </div>

            {/* Gifting Profile */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <Gift className="h-5 w-5 text-pink-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Gifting Profile</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Generates personalized gifting preferences and budget ranges
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Privacy & Data Usage</AlertTitle>
        <AlertDescription>
          All enrichment happens securely on our servers. Inferred data is marked with confidence
          scores. You can review and reject any predictions before saving. We never share your
          contact data with third parties.
        </AlertDescription>
      </Alert>

      {/* Action Section */}
      <Card>
        <CardHeader>
          <CardTitle>Start Enrichment</CardTitle>
          <CardDescription>
            This will analyze all your contacts and predict missing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Trigger Button */}
          {status === 'idle' && (
            <AutoPopulateButton
              onEnrichmentStart={handleEnrichmentStart}
              onEnrichmentComplete={handleEnrichmentComplete}
              onEnrichmentError={handleEnrichmentError}
              disabled={status !== 'idle'}
            />
          )}

          {/* Progress Display */}
          {status !== 'idle' && (
            <AutoPopulateProgress
              status={status}
              progress={progress}
              totalContacts={totalContacts}
              processedContacts={processedContacts}
              successCount={successCount}
              errorCount={errorCount}
              currentContact={currentContact}
              errorMessage={errorMessage}
              onCancel={handleCancel}
              onRetry={handleRetry}
              onClose={() => setStatus('idle')}
            />
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {enrichedContacts.length > 0 && (
        <>
          {/* Bulk Controls */}
          <BulkContactControls
            enrichedContacts={enrichedContacts}
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
            onSaveToDatabase={handleSaveToDatabase}
            onReset={handleReset}
            disabled={status === 'running'}
          />

          {/* Enriched Contacts Display */}
          <EnrichedContactsDisplay
            contacts={enrichedContacts}
            onEditContact={handleEditContact}
          />
        </>
      )}

      {/* Edit Modal */}
      <EditContactDialog
        contact={editingContact}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveContact}
      />

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5 text-blue-500" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                1
              </Badge>
              <div>
                <strong>Click &quot;Auto-Populate Contacts&quot;</strong> to start the enrichment process
              </div>
            </li>
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                2
              </Badge>
              <div>
                <strong>Review enriched data</strong> with confidence scores and reasoning
              </div>
            </li>
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                3
              </Badge>
              <div>
                <strong>Accept or reject</strong> predictions individually or in bulk
              </div>
            </li>
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                4
              </Badge>
              <div>
                <strong>Save to database</strong> to persist accepted enrichments
              </div>
            </li>
          </ol>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm">
            <strong>💡 Tip:</strong> Inferred data is marked with{' '}
            <Badge variant="outline" className="inline-flex items-center gap-1 text-xs">
              <InfoIcon className="h-3 w-3" />
              inferred
            </Badge>{' '}
            badges. Hover over them to see confidence scores and reasoning.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
