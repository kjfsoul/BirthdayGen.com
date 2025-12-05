'use client';

/**
 * ThreeWordsGame Component
 * Phase 3 - Gift Recommendation Engine
 *
 * Engagement game: "Describe your person in 3 words"
 * Extracts personality traits, tone, and aesthetic preferences
 * to enhance gift recommendations.
 */

import { useState, useEffect } from 'react';
import type { ThreeWordsGameAnswer } from '@/lib/gifts/schema';

interface ThreeWordsGameProps {
  recipientName?: string;
  onComplete: (answer: ThreeWordsGameAnswer) => void;
  className?: string;
}

/**
 * Trait extraction using keyword matching
 */
const PERSONALITY_KEYWORDS = {
  adventurous: ['adventurous', 'daring', 'bold', 'explorer', 'wild', 'fearless'],
  creative: ['creative', 'artistic', 'imaginative', 'inventive', 'original', 'innovative'],
  thoughtful: ['thoughtful', 'caring', 'considerate', 'empathetic', 'kind', 'compassionate'],
  fun: ['fun', 'playful', 'cheerful', 'lively', 'energetic', 'spirited'],
  sophisticated: ['sophisticated', 'elegant', 'refined', 'classy', 'polished', 'cultured'],
  practical: ['practical', 'pragmatic', 'sensible', 'realistic', 'logical', 'grounded'],
  spiritual: ['spiritual', 'mindful', 'zen', 'peaceful', 'meditative', 'soulful'],
  intellectual: ['intellectual', 'smart', 'brilliant', 'wise', 'scholarly', 'cerebral'],
  outdoorsy: ['outdoorsy', 'nature-lover', 'athletic', 'active', 'sporty', 'fit'],
  tech: ['techy', 'geeky', 'tech-savvy', 'digital', 'modern', 'innovative'],
};

const TONE_KEYWORDS = {
  playful: ['playful', 'fun', 'silly', 'goofy', 'cheerful', 'lighthearted'],
  sophisticated: ['sophisticated', 'elegant', 'refined', 'classy', 'mature', 'polished'],
  warm: ['warm', 'cozy', 'caring', 'loving', 'affectionate', 'tender'],
  edgy: ['edgy', 'bold', 'daring', 'unconventional', 'rebellious', 'fierce'],
  calm: ['calm', 'peaceful', 'serene', 'tranquil', 'zen', 'relaxed'],
  vibrant: ['vibrant', 'colorful', 'energetic', 'lively', 'dynamic', 'spirited'],
};

const AESTHETIC_KEYWORDS = {
  minimalist: ['minimalist', 'simple', 'clean', 'modern', 'sleek', 'understated'],
  bohemian: ['bohemian', 'boho', 'eclectic', 'artistic', 'free-spirited', 'hippie'],
  luxurious: ['luxurious', 'fancy', 'upscale', 'elegant', 'premium', 'high-end'],
  vintage: ['vintage', 'retro', 'classic', 'timeless', 'old-school', 'nostalgic'],
  natural: ['natural', 'organic', 'earthy', 'rustic', 'eco', 'green'],
  glam: ['glam', 'glamorous', 'sparkly', 'chic', 'fashionable', 'stylish'],
};

/**
 * Extract traits from words using keyword matching
 */
function extractTraits(words: string[]): ThreeWordsGameAnswer['extractedTraits'] {
  const normalizedWords = words.map(w => w.toLowerCase().trim());

  const personality: string[] = [];
  const tone: string[] = [];
  const aesthetic: string[] = [];

  // Check personality traits
  for (const [trait, keywords] of Object.entries(PERSONALITY_KEYWORDS)) {
    if (normalizedWords.some(word => keywords.some(keyword => word.includes(keyword)))) {
      personality.push(trait);
    }
  }

  // Check tone
  for (const [toneType, keywords] of Object.entries(TONE_KEYWORDS)) {
    if (normalizedWords.some(word => keywords.some(keyword => word.includes(keyword)))) {
      tone.push(toneType);
    }
  }

  // Check aesthetic
  for (const [aestheticType, keywords] of Object.entries(AESTHETIC_KEYWORDS)) {
    if (normalizedWords.some(word => keywords.some(keyword => word.includes(keyword)))) {
      aesthetic.push(aestheticType);
    }
  }

  // If no matches, infer from common patterns
  if (personality.length === 0) {
    personality.push('thoughtful'); // Default fallback
  }
  if (tone.length === 0) {
    tone.push('warm'); // Default fallback
  }
  if (aesthetic.length === 0) {
    aesthetic.push('natural'); // Default fallback
  }

  return { personality, tone, aesthetic };
}

export default function ThreeWordsGame({ recipientName, onComplete, className = '' }: ThreeWordsGameProps) {
  const [words, setWords] = useState<string[]>(['', '', '']);
  const [isComplete, setIsComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Update word at specific index
  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  // Check if all words are filled
  useEffect(() => {
    const allFilled = words.every(w => w.trim().length > 0);
    setIsComplete(allFilled);
  }, [words]);

  // Submit words
  const handleSubmit = () => {
    if (!isComplete) return;

    const extractedTraits = extractTraits(words);
    const answer: ThreeWordsGameAnswer = {
      words: words.map(w => w.trim()),
      extractedTraits,
    };

    setShowPreview(true);
    onComplete(answer);
  };

  return (
    <div className={`rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-2 text-4xl">💭</div>
        <h3 className="mb-2 text-2xl font-bold text-purple-900">
          Describe {recipientName || 'them'} in 3 words
        </h3>
        <p className="text-sm text-purple-700">
          Help us understand their personality to find the perfect gift
        </p>
      </div>

      {/* Word inputs */}
      <div className="mb-6 space-y-4">
        {words.map((word, index) => (
          <div key={index}>
            <label
              htmlFor={`word-${index}`}
              className="mb-1 block text-sm font-medium text-purple-800"
            >
              Word {index + 1}
            </label>
            <input
              id={`word-${index}`}
              type="text"
              value={word}
              onChange={(e) => handleWordChange(index, e.target.value)}
              placeholder={
                index === 0
                  ? 'e.g., adventurous'
                  : index === 1
                    ? 'e.g., creative'
                    : 'e.g., thoughtful'
              }
              className="w-full rounded-lg border-2 border-purple-300 bg-white px-4 py-3 text-lg text-purple-900 placeholder-purple-400 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              maxLength={30}
              disabled={showPreview}
            />
          </div>
        ))}
      </div>

      {/* Preview of extracted traits */}
      {showPreview && (
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-purple-900">
            ✨ We detected these traits:
          </p>
          <div className="flex flex-wrap gap-2">
            {extractTraits(words).personality.map((trait) => (
              <span
                key={trait}
                className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700"
              >
                {trait}
              </span>
            ))}
            {extractTraits(words).tone.map((toneType) => (
              <span
                key={toneType}
                className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700"
              >
                {toneType}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!isComplete || showPreview}
        className={`w-full rounded-lg py-3 font-semibold text-white transition-all ${isComplete && !showPreview
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg'
            : 'cursor-not-allowed bg-gray-300'
          }`}
      >
        {showPreview ? '✓ Complete' : isComplete ? 'Continue' : 'Enter 3 words to continue'}
      </button>

      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-purple-600">
        Tip: Be specific! Words like &quot;adventurous,&quot; &quot;cozy,&quot; or &quot;tech-savvy&quot; help us find better matches.
      </p>
    </div>
  );
}
