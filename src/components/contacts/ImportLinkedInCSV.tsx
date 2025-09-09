'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface ParsedContact {
  name: string;
  email: string;
  company: string;
  title: string;
  url: string;
}

export function ImportLinkedInCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const parseCSV = useCallback((content: string): { headers: string[]; rows: string[][] } => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line =>
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    return { headers, rows };
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a .csv file');
      return;
    }

    setFile(selectedFile);

    try {
      const content = await selectedFile.text();
      const { headers: csvHeaders, rows } = parseCSV(content);
      setHeaders(csvHeaders);

      // Initialize mapping
      const initialMapping: Record<string, string> = {};
      csvHeaders.forEach(header => {
        const lower = header.toLowerCase();
        if (lower.includes('name') || lower.includes('first') || lower.includes('last')) {
          initialMapping[header] = 'name';
        } else if (lower.includes('email')) {
          initialMapping[header] = 'email';
        } else if (lower.includes('company') || lower.includes('organization')) {
          initialMapping[header] = 'company';
        } else if (lower.includes('title') || lower.includes('position')) {
          initialMapping[header] = 'title';
        } else if (lower.includes('url') || lower.includes('profile')) {
          initialMapping[header] = 'url';
        }
      });
      setMapping(initialMapping);

      // Parse contacts
      const parsedContacts: ParsedContact[] = rows.map(row => ({
        name: row[csvHeaders.indexOf(Object.keys(initialMapping).find(h => initialMapping[h] === 'name') || '')] || '',
        email: row[csvHeaders.indexOf(Object.keys(initialMapping).find(h => initialMapping[h] === 'email') || '')] || '',
        company: row[csvHeaders.indexOf(Object.keys(initialMapping).find(h => initialMapping[h] === 'company') || '')] || '',
        title: row[csvHeaders.indexOf(Object.keys(initialMapping).find(h => initialMapping[h] === 'title') || '')] || '',
        url: row[csvHeaders.indexOf(Object.keys(initialMapping).find(h => initialMapping[h] === 'url') || '')] || '',
      }));
      setContacts(parsedContacts);
      toast.success(`Parsed ${parsedContacts.length} contacts`);
    } catch (error) {
      toast.error('Failed to parse CSV file');
      console.error(error);
    }
  }, [parseCSV]);

  const handleMappingChange = (header: string, field: string) => {
    setMapping(prev => ({ ...prev, [header]: field }));
  };

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Placeholder: In a real implementation, this would upload to an API
      toast.success('LinkedIn CSV import not yet implemented');
    } catch (error) {
      toast.error('Upload failed');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from LinkedIn CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Select a .csv file exported from LinkedIn connections
          </p>
        </div>

        {headers.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Map Headers</h3>
            <div className="grid grid-cols-2 gap-4">
              {headers.map(header => (
                <div key={header} className="space-y-2">
                  <label className="text-sm font-medium">{header}</label>
                  <Select value={mapping[header] || ''} onValueChange={(value) => handleMappingChange(header, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="">Ignore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {contacts.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Preview ({contacts.length} contacts)</h3>
            <div className="max-h-64 overflow-y-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.slice(0, 5).map((contact, index) => (
                    <TableRow key={index}>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.company}</TableCell>
                      <TableCell>{contact.title}</TableCell>
                      <TableCell>{contact.url}</TableCell>
                    </TableRow>
                  ))}
                  {contacts.length > 5 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        ... and {contacts.length - 5} more
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Import Contacts'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
