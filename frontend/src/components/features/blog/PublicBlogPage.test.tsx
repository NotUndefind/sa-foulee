import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PublicBlogPage from './PublicBlogPage'

const post = {
  id: 1,
  title: 'Cross de la Neuville',
  slug: 'cross-de-la-neuville',
  content: '<p>Un super compte-rendu de course.</p>',
  image: null,
  author: { id: 1, name: 'Alice Martin' },
  is_pinned: false,
  published_at: '2026-06-01T10:00:00Z',
  created_at: '2026-06-01T10:00:00Z',
  comments_count: 2,
}

describe('PublicBlogPage (smoke)', () => {
  it('rend les articles fournis par le serveur sans fetch initial', () => {
    render(
      <PublicBlogPage
        initialData={{
          data: [post],
          meta: { current_page: 1, last_page: 1, total: 1, per_page: 10 },
        }}
      />
    )

    expect(screen.getByText('Cross de la Neuville')).toBeInTheDocument()
    expect(screen.getByText('Un super compte-rendu de course.')).toBeInTheDocument()
    // Le lien vers la page article (slug) est présent.
    expect(screen.getByRole('link', { name: /lire l'article/i })).toHaveAttribute(
      'href',
      '/blog/cross-de-la-neuville'
    )
  })

  it("affiche l'état vide sans article", () => {
    render(
      <PublicBlogPage
        initialData={{
          data: [],
          meta: { current_page: 1, last_page: 1, total: 0, per_page: 10 },
        }}
      />
    )

    expect(screen.getByText(/aucun article/i)).toBeInTheDocument()
  })
})
