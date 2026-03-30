import { api } from './api'

export interface NewsletterToggleResponse {
  subscribed: boolean
  newsletter_subscribed_at: string | null
}

export function toggleNewsletter(subscribed: boolean): Promise<NewsletterToggleResponse> {
  return api.patch<NewsletterToggleResponse>('/me/newsletter', { subscribed })
}
