import { api } from './api'

export interface NewsletterToggleResponse {
  subscribed: boolean
  newsletter_subscribed_at: string | null
}

export interface Campaign {
  id: number
  subject: string
  body_html: string
  sent_at: string | null
  recipient_count: number
  created_at: string
  creator?: { id: number; first_name: string; last_name: string }
}

export function toggleNewsletter(subscribed: boolean): Promise<NewsletterToggleResponse> {
  return api.patch<NewsletterToggleResponse>('/me/newsletter', { subscribed })
}

export function getCampaigns(): Promise<Campaign[]> {
  return api.get<Campaign[]>('/admin/newsletter/campaigns')
}

export function createCampaign(data: { subject: string; body_html: string }): Promise<Campaign> {
  return api.post<Campaign>('/admin/newsletter/campaigns', data)
}

export function updateCampaign(id: number, data: { subject?: string; body_html?: string }): Promise<Campaign> {
  return api.patch<Campaign>(`/admin/newsletter/campaigns/${id}`, data)
}

export function sendCampaign(id: number): Promise<{ message: string; recipient_count: number }> {
  return api.post(`/admin/newsletter/campaigns/${id}/send`)
}
