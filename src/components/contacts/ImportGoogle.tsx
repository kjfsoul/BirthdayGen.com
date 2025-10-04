'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function ImportGoogle() {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    setIsImporting(true);
    // The API route handles the redirect to Google OAuth
    window.location.href = '/api/import/google/start';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Google</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Google account to import contacts from Google People API.
        </p>
        <Button onClick={handleImport} disabled={isImporting}>
          {isImporting ? 'Connecting...' : 'Connect Google Account'}
        </Button>
      </CardContent>
    </Card>
  );
}
