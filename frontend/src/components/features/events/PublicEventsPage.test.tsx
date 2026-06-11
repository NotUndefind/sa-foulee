import type { Event } from '@/types'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PublicEventsPage from './PublicEventsPage'

const event: Event = {
  id: 1,
  title: 'Sortie longue du dimanche',
  description: 'Sortie de 15 km allure tranquille.',
  type: 'outing',
  event_date: '2026-07-05T09:00:00Z',
  location: 'La Neuville',
  created_by: 1,
  is_public: true,
  registrations_count: 4,
  created_at: '2026-06-01T10:00:00Z',
}

describe('PublicEventsPage (smoke)', () => {
  it('rend les événements fournis par le serveur sans fetch initial', () => {
    render(<PublicEventsPage initialEvents={[event]} />)

    expect(screen.getByText('Sortie longue du dimanche')).toBeInTheDocument()
    expect(screen.getByText(/la neuville/i)).toBeInTheDocument()
  })

  it("affiche l'état vide sans événement", () => {
    render(<PublicEventsPage initialEvents={[]} />)

    expect(screen.getByText(/aucun événement/i)).toBeInTheDocument()
  })
})
