/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Simple analytics utility for tracking events
// In production, replace with proper analytics service

export type AnalyticsEvent =
  | 'page_view'
  | 'nav_click'
  | 'cta_click'
  | 'subscribe_submit'
  | 'signup_open'
  | 'contacts_cta_opened'
  | 'google_import_started'
  | 'outlook_import_started'
  | 'microsoft_import_started'
  | 'apple_import_started'
  | 'social_import_started'
  | 'linkedin_import_started'
  | 'facebook_import_started'

interface EventData {
  event: AnalyticsEvent
  page?: string
  href?: string
  [key: string]: any
}

export function trackEvent(data: EventData) {
  // Development: log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', data)
    return
  }

  // Production: send to analytics service
  // Example: send to Supabase or external service
}
