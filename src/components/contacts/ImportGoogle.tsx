'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ImportGoogle() {
  const handleImport = () => {
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
        <Button onClick={handleImport}>
          Connect Google Account
        </Button>
      </CardContent>
    </Card>
  );
}
