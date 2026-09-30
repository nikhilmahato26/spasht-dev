import type { MetadataRoute } from "next";

// Needed for "Add to Home Screen" — iOS only delivers web push to installed apps.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spasht Finance Tracker",
    short_name: "Spasht",
    description: "Internal job-costing and team payout tool for spasht.dev",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    background_color: "#f5f5f2",
    theme_color: "#1b1d1e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
