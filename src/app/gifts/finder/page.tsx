'use client';

/**
 * Gift Finder Page
 * Phase 3 - BirthdayGen.com (AI Gift Recommendation Foundation)
 *
 * Main UI for finding gift recommendations.
 * Includes:
 * - Basic input form (recipient name, budget, occasion)
 * - Engagement games (ThreeWordsGame, PickTheirVibeGame)
 * - Gift recommendation display with cards
 * - Product details, reasoning, confidence scores
 */

import { useState } from 'react';
import ThreeWordsGame from '@/components/gifts/games/ThreeWordsGame';
import PickTheirVibeGame from '@/components/gifts/games/PickTheirVibeGame';
import type {
  ThreeWordsGameAnswer,
  PickTheirVibeGameAnswer,
  EngagementGameAnswers,
  RecipientProfile,
  GiftRecommendation,
  RecommendationResponse,
  OccasionType,
} from '@/lib/gifts/schema';
import { OCCASION_LABELS, OccasionType as OccasionEnum, CATEGORY_LABELS } from '@/lib/gifts/schema';
import {
  enhanceRecipientProfile,
  buildRecommendationRequest,
} from '@/lib/gifts/engagement-processor';

type FormStep = 'basic' | 'games' | 'results';

export default function GiftFinderPage() {
  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState<OccasionType>(OccasionEnum.BIRTHDAY);
  const [budgetMin, setBudgetMin] = useState(25);
  const [budgetMax, setBudgetMax] = useState(100);

  // Engagement game state
  const [threeWordsAnswer, setThreeWordsAnswer] = useState<ThreeWordsGameAnswer | null>(null);
  const [vibeAnswer, setVibeAnswer] = useState<PickTheirVibeGameAnswer | null>(null);

  // Results state
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [recipientSummary, setRecipientSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle basic form submission
  const handleBasicFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      alert('Please enter a recipient name');
      return;
    }

    if (budgetMax < budgetMin) {
      alert('Maximum budget must be greater than minimum budget');
      return;
    }

    setCurrentStep('games');
  };

  // Handle engagement games completion
  const handleGamesComplete = async () => {
    if (!threeWordsAnswer || !vibeAnswer) {
      alert('Please complete both engagement games');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build engagement answers
      const engagementAnswers: EngagementGameAnswers = {
        threeWords: threeWordsAnswer,
        pickTheirVibe: vibeAnswer,
      };

      // Build recipient profile
      const baseProfile: Partial<RecipientProfile> = {
        name: recipientName,
      };

      const recipientProfile = enhanceRecipientProfile(baseProfile, engagementAnswers);

      // Build recommendation request
      const request = buildRecommendationRequest(recipientProfile, engagementAnswers, {
        occasion,
        budgetMin,
        budgetMax,
        budgetPreferred: Math.round((budgetMin + budgetMax) / 2),
        urgency: 'medium',
      });

      // Call API
      const response = await fetch('/api/gift-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data: RecommendationResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to get recommendations');
      }

      // Update state with recommendations
      setRecommendations(data.recommendations);
      setRecipientSummary(data.recipientSummary);
      setCurrentStep('results');
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to start
  const handleStartOver = () => {
    setCurrentStep('basic');
    setRecipientName('');
    setOccasion(OccasionEnum.BIRTHDAY);
    setBudgetMin(25);
    setBudgetMax(100);
    setThreeWordsAnswer(null);
    setVibeAnswer(null);
    setRecommendations([]);
    setRecipientSummary('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            🎁 Gift Finder
          </h1>
          <p className="text-lg text-gray-700">
            Find the perfect gift with AI-powered recommendations
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center space-x-4">
            <StepIndicator number={1} label="Basic Info" active={currentStep === 'basic'} complete={currentStep !== 'basic'} />
            <div className="h-0.5 w-12 bg-gray-300" />
            <StepIndicator number={2} label="Engagement Games" active={currentStep === 'games'} complete={currentStep === 'results'} />
            <div className="h-0.5 w-12 bg-gray-300" />
            <StepIndicator number={3} label="Results" active={currentStep === 'results'} />
          </div>
        </div>

        {/* Content based on step */}
        <div className="mx-auto max-w-4xl">
          {/* STEP 1: Basic Form */}
          {currentStep === 'basic' && (
            <form onSubmit={handleBasicFormSubmit} className="rounded-2xl bg-white p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Tell us about your gift</h2>

              {/* Recipient Name */}
              <div className="mb-6">
                <label htmlFor="recipientName" className="mb-2 block text-sm font-semibold text-gray-700">
                  Who are you shopping for? *
                </label>
                <input
                  id="recipientName"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., Sarah, Mom, Best Friend"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  required
                />
              </div>

              {/* Occasion */}
              <div className="mb-6">
                <label htmlFor="occasion" className="mb-2 block text-sm font-semibold text-gray-700">
                  What&apos;s the occasion? *
                </label>
                <select
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value as OccasionType)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {Object.entries(OCCASION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Budget Range *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="budgetMin" className="mb-1 block text-xs text-gray-600">
                      Min ($)
                    </label>
                    <input
                      id="budgetMin"
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(Number(e.target.value))}
                      min="0"
                      step="5"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="pt-6 text-gray-400">—</div>
                  <div className="flex-1">
                    <label htmlFor="budgetMax" className="mb-1 block text-xs text-gray-600">
                      Max ($)
                    </label>
                    <input
                      id="budgetMax"
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(Number(e.target.value))}
                      min="0"
                      step="5"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Budget: ${budgetMin} - ${budgetMax}
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-lg transition-all"
              >
                Continue to Engagement Games →
              </button>
            </form>
          )}

          {/* STEP 2: Engagement Games */}
          {currentStep === 'games' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Help us understand {recipientName}
                </h2>
                <p className="mb-6 text-sm text-gray-600">
                  Play these quick games to get personalized recommendations
                </p>

                {/* ThreeWordsGame */}
                <div className="mb-6">
                  <ThreeWordsGame
                    recipientName={recipientName}
                    onComplete={setThreeWordsAnswer}
                  />
                </div>

                {/* PickTheirVibeGame */}
                <div className="mb-6">
                  <PickTheirVibeGame
                    recipientName={recipientName}
                    onComplete={setVibeAnswer}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep('basic')}
                    className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleGamesComplete}
                    disabled={!threeWordsAnswer || !vibeAnswer || isLoading}
                    className={`flex-1 rounded-lg py-3 font-semibold text-white transition-all ${threeWordsAnswer && vibeAnswer && !isLoading
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg'
                      : 'cursor-not-allowed bg-gray-300'
                      }`}
                  >
                    {isLoading ? 'Finding gifts...' : 'Get Recommendations →'}
                  </button>
                </div>

                {/* Error display */}
                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Results */}
          {currentStep === 'results' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                  Gift Recommendations for {recipientName}
                </h2>
                <p className="text-gray-700">{recipientSummary}</p>

                {/* Insights */}
                {threeWordsAnswer && vibeAnswer && (
                  <div className="mt-4 rounded-lg bg-purple-50 p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      ✨ Profile Summary:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {threeWordsAnswer.words.map((word, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800"
                        >
                          {word}
                        </span>
                      ))}
                      {vibeAnswer.selectedVibes.slice(0, 3).map((vibe) => (
                        <span
                          key={vibe}
                          className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                        >
                          {vibe}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendation Cards */}
              {recommendations.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {recommendations.map((rec) => (
                    <GiftRecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-12 text-center shadow-xl">
                  <div className="mb-4 text-6xl">🤷</div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    No recommendations found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your budget or preferences
                  </p>
                </div>
              )}

              {/* Start Over button */}
              <div className="text-center">
                <button
                  onClick={handleStartOver}
                  className="rounded-lg border-2 border-purple-300 bg-white px-8 py-3 font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  ← Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StepIndicator({
  number,
  label,
  active,
  complete,
}: {
  number: number;
  label: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${complete
          ? 'bg-green-500 text-white'
          : active
            ? 'bg-purple-500 text-white'
            : 'bg-gray-300 text-gray-600'
          }`}
      >
        {complete ? '✓' : number}
      </div>
      <div
        className={`hidden text-sm font-medium sm:block ${active ? 'text-purple-700' : 'text-gray-500'
          }`}
      >
        {label}
      </div>
    </div>
  );
}

function GiftRecommendationCard({ recommendation }: { recommendation: GiftRecommendation }) {
  const { product, confidence, matchFactors, whyThisGift, personalizeIdea } = recommendation;

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-2xl">
      {/* Header with confidence */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 text-xl font-bold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600">{CATEGORY_LABELS[product.category]}</p>
        </div>
        <div className="ml-4 flex flex-col items-end">
          <div
            className={`rounded-full px-3 py-1 text-xs font-bold ${confidence >= 80
              ? 'bg-green-100 text-green-700'
              : confidence >= 60
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
              }`}
          >
            {confidence}% Match
          </div>
          <div className="mt-1 text-lg font-bold text-purple-600">
            ${product.estimatedPrice}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-700">{product.description}</p>

      {/* Why this gift */}
      <div className="mb-4 rounded-lg bg-purple-50 p-3">
        <p className="text-xs font-semibold text-purple-900 mb-1">💡 Why this gift:</p>
        <p className="text-sm text-purple-800">{whyThisGift}</p>
      </div>

      {/* Match factors */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-gray-700">Match Factors:</p>
        <div className="space-y-1">
          <MatchFactor label="Style" score={matchFactors.giftingStyleMatch} />
          <MatchFactor label="Occasion" score={matchFactors.occasionMatch} />
          <MatchFactor label="Budget" score={matchFactors.budgetMatch} />
        </div>
      </div>

      {/* Personalize idea */}
      {personalizeIdea && (
        <div className="rounded-lg border border-pink-200 bg-pink-50 p-3">
          <p className="text-xs font-semibold text-pink-900 mb-1">✨ Make it personal:</p>
          <p className="text-xs text-pink-800">{personalizeIdea}</p>
        </div>
      )}

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {product.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function MatchFactor({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="w-20 text-xs text-gray-600">{label}:</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
            }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-10 text-xs text-gray-600 text-right">{score}%</span>
    </div>
  );
}
