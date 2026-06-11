import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.laneuvilletafsafoulee.fr'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Espaces privés et pages de compte : inutiles aux moteurs.
      disallow: ['/tableau-de-bord', '/connexion', '/inscription', '/desabonnement'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
