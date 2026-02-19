import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PocketLawyer - AI Legal Assistant",
    short_name: "PocketLawyer",
    description:
      "Get answers to your legal questions with AI assistance. Professional legal guidance powered by artificial intelligence.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e40af",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon-light.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["legal", "productivity", "utilities"],
    lang: "en",
    dir: "ltr",
  }
}
