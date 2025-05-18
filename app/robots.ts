import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/', 
        '/profile/',
        '/welcome/',
      ],
    },
    sitemap: 'https://pocketlawyer.esq/sitemap.xml',
  }
}