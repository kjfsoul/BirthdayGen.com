'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  HelpCircle,
  Sparkles,
  Gift,
  Heart,
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Edit,
} from 'lucide-react';
import type { EnrichedContact } from '@/lib/autopopulate/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EnrichedContactsDisplayProps {
  contacts: EnrichedContact[];
  onEditContact?: (contact: EnrichedContact) => void;
  onAcceptContact?: (contactId: number) => void;
  onRejectContact?: (contactId: number) => void;
  className?: string;
}

/**
 * EnrichedContactsDisplay - Display enriched contacts in table/card layout
 * 
 * Features:
 * - Visual distinction between "inferred" vs "confirmed" data
 * - Confidence scores with color coding
 * - Birthday predictions with reasoning
 * - Relationship types with icons
 * - Archetype tags
 * - Gifting profile displays
 * - Individual edit controls
 */
export function EnrichedContactsDisplay({
  contacts,
  onEditContact,
  onAcceptContact,
  onRejectContact,
  className = '',
}: EnrichedContactsDisplayProps) {
  const [expandedContact, setExpandedContact] = useState<number | null>(null);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBadge = (confidence: number): "default" | "secondary" | "destructive" => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'destructive';
  };

  const getRelationshipIcon = (type?: string) => {
    switch (type) {
      case 'family':
        return <Heart className="h-4 w-4" />;
      case 'close_friend':
        return <Users className="h-4 w-4" />;
      case 'colleague':
      case 'professional':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatBirthday = (birthday?: { month?: number; day?: number; year?: number }) => {
    if (!birthday || !birthday.month || !birthday.day) return 'N/A';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[birthday.month - 1]} ${birthday.day}${birthday.year ? `, ${birthday.year}` : ''}`;
  };

  if (contacts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          No enriched contacts to display
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Enriched Contacts ({contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Birthday</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Archetype</TableHead>
                  <TableHead>Gifting Style</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <>
                    <TableRow
                      key={contact.id || `contact-${Math.random()}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedContact(expandedContact === contact.id ? null : (contact.id || null))}
                    >
                      {/* Name */}
                      <TableCell className="font-medium">
                        {contact.fullName || 'Unknown'}
                      </TableCell>

                      {/* Birthday */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {contact.predictedBirthday ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">
                                      {formatBirthday({
                                        month: contact.predictedBirthday.month,
                                        day: contact.predictedBirthday.day,
                                      })}
                                    </span>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    <div className="font-semibold">Inferred</div>
                                    <div>Confidence: {contact.predictedBirthday.confidence}%</div>
                                    <div className="mt-1 text-muted-foreground max-w-xs">
                                      {contact.predictedBirthday.reasoning}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : contact.birthday ? (
                            <div className="flex items-center gap-1">
                              <span className="text-sm">{formatBirthday(contact.birthday)}</span>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unknown</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Relationship */}
                      <TableCell>
                        {contact.inferredRelationship ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="gap-1">
                                  {getRelationshipIcon(contact.inferredRelationship.type)}
                                  <span className="capitalize">
                                    {contact.inferredRelationship.type.replace('_', ' ')}
                                  </span>
                                  <HelpCircle className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <div className="font-semibold">Inferred</div>
                                  <div>Confidence: {contact.inferredRelationship.confidence}%</div>
                                  <div className="mt-1 text-muted-foreground max-w-xs">
                                    {contact.inferredRelationship.reasoning}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>

                      {/* Archetype */}
                      <TableCell>
                        {contact.archetypes && contact.archetypes.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {contact.archetypes.slice(0, 2).map((archetype) => (
                              <TooltipProvider key={archetype.id}>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge
                                      variant={getConfidenceBadge(archetype.confidence)}
                                      className="text-xs"
                                    >
                                      {archetype.name}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs max-w-xs">
                                      <div className="font-semibold">{archetype.name}</div>
                                      <div className="text-muted-foreground">{archetype.description}</div>
                                      <div className="mt-1">
                                        Confidence: {archetype.confidence}%
                                      </div>
                                      <div className="flex gap-1 flex-wrap mt-1">
                                        {archetype.tags.map((tag) => (
                                          <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Gifting Style */}
                      <TableCell>
                        {contact.giftingProfile ? (
                          <Badge variant="outline" className="gap-1 capitalize">
                            <Gift className="h-3 w-3" />
                            {contact.giftingProfile.style.replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Overall Confidence */}
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={`flex items-center justify-center gap-1 ${getConfidenceColor(
                                  contact.enrichmentMetadata.confidence.overall
                                )}`}
                              >
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-semibold">
                                  {contact.enrichmentMetadata.confidence.overall}%
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-semibold">Confidence Breakdown:</div>
                                <div>Birthday: {contact.enrichmentMetadata.confidence.birthday}%</div>
                                <div>Relationship: {contact.enrichmentMetadata.confidence.relationship}%</div>
                                <div>Archetype: {contact.enrichmentMetadata.confidence.archetype}%</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {onEditContact && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditContact(contact);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Details */}
                    {expandedContact === contact.id && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <div className="p-4 space-y-3">
                            {/* Gifting Profile Details */}
                            {contact.giftingProfile && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Gift className="h-4 w-4" />
                                  Gifting Profile
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Sentimental:</span>
                                    <span className="ml-1 font-medium">
                                      {contact.giftingProfile.preferences.sentimental}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Practical:</span>
                                    <span className="ml-1 font-medium">
                                      {contact.giftingProfile.preferences.practical}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Experiential:</span>
                                    <span className="ml-1 font-medium">
                                      {contact.giftingProfile.preferences.experiential}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Luxurious:</span>
                                    <span className="ml-1 font-medium">
                                      {contact.giftingProfile.preferences.luxurious}%
                                    </span>
                                  </div>
                                </div>
                                {contact.giftingProfile.interests.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-sm text-muted-foreground">Interests: </span>
                                    <div className="flex gap-1 flex-wrap mt-1">
                                      {contact.giftingProfile.interests.map((interest) => (
                                        <Badge key={interest} variant="secondary" className="text-xs">
                                          {interest}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Enrichment Metadata */}
                            <div className="text-xs text-muted-foreground">
                              Enriched on{' '}
                              {new Date(contact.enrichmentMetadata.enrichedAt).toLocaleDateString()} •
                              Fields: {contact.enrichmentMetadata.fieldsEnriched.join(', ')}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
