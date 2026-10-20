import { getPosts } from '@/lib/posts'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublicBlogPage from './PublicBlogPage'

vi.mock('@/lib/posts', () => ({ getPosts: vi.fn() }))
const getPostsMock = vi.mocked(getPosts)

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

describe('PublicBlogPage (pagination)', () => {
  const pagedMeta = (current_page: number) => ({
    current_page,
    last_page: 2,
    total: 2,
    per_page: 10,
  })

  beforeEach(() => {
    getPostsMock.mockReset()
    getPostsMock.mockImplementation(async ({ page = 1 } = {}) => ({
      data: [{ ...post, id: page, title: `Article page ${page}` }],
      meta: pagedMeta(page),
    }))
  })

  it('ne refetch pas la page 1 rendue côté serveur, mais recharge au retour sur la page 1', async () => {
    render(
      <PublicBlogPage
        initialData={{ data: [{ ...post, title: 'Article page 1' }], meta: pagedMeta(1) }}
      />
    )

    // Hydratation : aucune requête, contenu serveur affiché.
    expect(getPostsMock).not.toHaveBeenCalled()
    expect(screen.getByText('Article page 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /suivant/i }))
    await screen.findByText('Article page 2')
    expect(getPostsMock).toHaveBeenLastCalledWith({ page: 2 })

    fireEvent.click(screen.getByRole('button', { name: /précédent/i }))
    await waitFor(() => expect(getPostsMock).toHaveBeenLastCalledWith({ page: 1 }))
    await screen.findByText('Article page 1')
    expect(screen.queryByText('Article page 2')).not.toBeInTheDocument()
  })
})
