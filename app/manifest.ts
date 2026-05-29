import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MechNow",
    short_name: "MechNow",
    description: "Mobile-first booking app for on-site mechanic services.",
    start_url: "/booking",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f7f2",
    theme_color: "#0f6b4f",
    categories: ["business", "productivity", "utilities"],
    lang: "es",
    icons: [
      {
        src: "/icons/icon-180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
