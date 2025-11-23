'use client';

/**
 * PickTheirVibeGame Component
 * Phase 3 - Gift Recommendation Engine
 * 
 * Engagement game: Visual vibe picker
 * Users select vibes (cozy, cosmic, glam, tech, sporty, etc.)
 * to extract aesthetic and category preferences for gift recommendations.
 */

import { useState } from 'react';
import type { PickTheirVibeGameAnswer } from '@/lib/gifts/schema';
import { VIBE_OPTIONS, GiftCategory } from '@/lib/gifts/schema';

interface PickTheirVibeGameProps {
  recipientName?: string;
  onComplete: (answer: PickTheirVibeGameAnswer) => void;
  maxSelections?: number;
  className?: string;
}

/**
 * Map selected vibes to gift categories
 */
function mapVibesToCategories(selectedVibes: string[]): GiftCategory[] {
  const categories = new Set<GiftCategory>();
  
  selectedVibes.forEach((vibeId) => {
    const vibe = VIBE_OPTIONS.find((v) => v.id === vibeId);
    if (vibe) {
      vibe.associatedCategories.forEach((cat) => categories.add(cat));
    }
  });
  
  return Array.from(categories);
}

/**
 * Generate aesthetic profile from selected vibes
 */
function generateAestheticProfile(selectedVibes: string[]): string {
  const vibeLabels = selectedVibes
    .map((vibeId) => VIBE_OPTIONS.find((v) => v.id === vibeId)?.label.toLowerCase())
    .filter(Boolean);
  
  if (vibeLabels.length === 0) return 'eclectic';
  if (vibeLabels.length === 1) return vibeLabels[0] || 'eclectic';
  
  // Combine first two vibes for aesthetic profile
  return `${vibeLabels[0]}_${vibeLabels[1]}`;
}

export default function PickTheirVibeGame({
  recipientName,
  onComplete,
  maxSelections = 3,
  className = '',
}: PickTheirVibeGameProps) {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // Toggle vibe selection
  const handleVibeToggle = (vibeId: string) => {
    if (isComplete) return;
    
    setSelectedVibes((prev) => {
      if (prev.includes(vibeId)) {
        // Deselect
        return prev.filter((id) => id !== vibeId);
      } else {
        // Select (up to maxSelections)
        if (prev.length >= maxSelections) {
          return prev;
        }
        return [...prev, vibeId];
      }
    });
  };
  
  // Submit selections
  const handleSubmit = () => {
    if (selectedVibes.length === 0) return;
    
    const answer: PickTheirVibeGameAnswer = {
      selectedVibes,
      categoryPreferences: mapVibesToCategories(selectedVibes),
      aestheticProfile: generateAestheticProfile(selectedVibes),
    };
    
    setIsComplete(true);
    onComplete(answer);
  };
  
  const canSubmit = selectedVibes.length > 0 && !isComplete;
  
  return (
    <div className={`rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-2 text-4xl">✨</div>
        <h3 className="mb-2 text-2xl font-bold text-indigo-900">
          Pick {recipientName ? `${recipientName}'s` : 'their'} vibe
        </h3>
        <p className="text-sm text-indigo-700">
          Select up to {maxSelections} vibes that match their style
        </p>
        <p className="mt-1 text-xs font-medium text-indigo-600">
          {selectedVibes.length}/{maxSelections} selected
        </p>
      </div>
      
      {/* Vibe grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {VIBE_OPTIONS.map((vibe) => {
          const isSelected = selectedVibes.includes(vibe.id);
          const isMaxReached = selectedVibes.length >= maxSelections && !isSelected;
          
          return (
            <button
              key={vibe.id}
              onClick={() => handleVibeToggle(vibe.id)}
              disabled={isComplete || isMaxReached}
              className={`group relative flex flex-col items-center justify-center rounded-xl border-3 p-4 transition-all ${
                isSelected
                  ? 'scale-105 border-indigo-500 bg-white shadow-lg ring-4 ring-indigo-200'
                  : isMaxReached
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-50'
                  : 'border-transparent bg-white hover:border-indigo-300 hover:shadow-md'
              } ${isComplete ? 'cursor-default' : 'cursor-pointer'}`}
              style={{
                backgroundColor: isSelected ? vibe.color + '20' : undefined,
              }}
            >
              {/* Emoji */}
              <div className="mb-2 text-4xl">{vibe.emoji}</div>
              
              {/* Label */}
              <div className="text-center">
                <div
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-indigo-900' : 'text-gray-700 group-hover:text-indigo-800'
                  }`}
                >
                  {vibe.label}
                </div>
                <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {vibe.description}
                </div>
              </div>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Preview of selected vibes */}
      {selectedVibes.length > 0 && (
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-indigo-900">
            ✨ Selected vibes:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedVibes.map((vibeId) => {
              const vibe = VIBE_OPTIONS.find((v) => v.id === vibeId);
              if (!vibe) return null;
              
              return (
                <span
                  key={vibeId}
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: vibe.color }}
                >
                  <span>{vibe.emoji}</span>
                  <span>{vibe.label}</span>
                </span>
              );
            })}
          </div>
          
          {/* Show derived categories */}
          {!isComplete && selectedVibes.length > 0 && (
            <div className="mt-3 text-xs text-indigo-600">
              💡 We'll prioritize:{' '}
              {mapVibesToCategories(selectedVibes)
                .slice(0, 3)
                .map((cat) => cat.replace(/_/g, ' '))
                .join(', ')}
            </div>
          )}
        </div>
      )}
      
      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full rounded-lg py-3 font-semibold text-white transition-all ${
          canSubmit
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg'
            : 'cursor-not-allowed bg-gray-300'
        }`}
      >
        {isComplete
          ? '✓ Complete'
          : selectedVibes.length > 0
          ? 'Continue'
          : 'Select at least 1 vibe'}
      </button>
      
      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-indigo-600">
        Tip: Choose vibes that truly resonate with their personality and style!
      </p>
    </div>
  );
}
