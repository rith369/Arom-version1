import type { MetadataRoute } from "next";

// Lets people install AROM to their home screen. It opens full screen like an
// app. There is no service worker, so nothing is cached for offline use.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AROM: Your wellness space",
    short_name: "AROM",
    description: "A calmer mind, a brighter you.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7faf9",
    theme_color: "#1f6f5b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
