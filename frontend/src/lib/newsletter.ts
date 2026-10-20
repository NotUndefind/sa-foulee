import { api } from './api'

export interface NewsletterToggleResponse {
  subscribed: boolean
  newsletter_subscribed_at: string | null
}

export interface Campaign {
  id: number
  subject: string
  body_html: string
  /** Mise en file (envoi en arrière-plan) — null tant que non envoyée. */
  queued_at: string | null
  /** Posé à la fin du traitement de tous les envois (succès ou échec). */
  sent_at: string | null
  recipient_count: number
  /** Envois définitivement échoués, connu une fois sent_at posé. */
  failed_count: number | null
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

export function updateCampaign(
  id: number,
  data: { subject?: string; body_html?: string }
): Promise<Campaign> {
  return api.patch<Campaign>(`/admin/newsletter/campaigns/${id}`, data)
}

export type CampaignStatus = 'draft' | 'sending' | 'sent'

export function getCampaignStatus(
  campaign: Pick<Campaign, 'queued_at' | 'sent_at'>
): CampaignStatus {
  if (campaign.sent_at) return 'sent'
  if (campaign.queued_at) return 'sending'
  return 'draft'
}

export interface SendCampaignResponse {
  message: string
  recipient_count: number
  queued_at: string
}

export function sendCampaign(id: number): Promise<SendCampaignResponse> {
  return api.post<SendCampaignResponse>(`/admin/newsletter/campaigns/${id}/send`)
}
