import type { NextConfig } from "next";
// import { withAxiom } from "next-axiom";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  serverExternalPackages: ["pino", "pino-pretty", "@axiomhq/pino", "sharp"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
    agentUpgrade: "security",
  },
  cacheComponents: true,
  images: {
    // Keep resized photos for 7 days (Next.js default: 4 hours). Uploaded
    // photos get a new file name each time, so they never go stale. If you
    // replace a file in public/ under the same name, it can take up to 7
    // days to show — rename it instead.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Local Supabase (`npx supabase start`) serves uploads from 127.0.0.1,
    // which next/image blocks by default. Development only.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      ...(isDev
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "54321",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "hxkzggziycqzsfaprcno.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Added Cloudinary here
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.merchcommunication.com", // Added
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cruip-tutorials.vercel.app",
        pathname: "/**", // allow all paths
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**", // allow all paths
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**", // allow all paths
      },
      {
        protocol: "https",
        hostname: "i.ibb.co.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async redirects() {
    return [
      // The team moved to the About Us page.
      { source: "/teams", destination: "/about#team", permanent: true },
    ];
  },

  async headers() {
    const rules = [
      // Security headers for all routes
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },

      // ✅ Next.js built static assets (JS, CSS chunks)
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ Next.js optimized images
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ Your custom static folder
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ Images in /public/images
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ Fonts
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ Favicon and icons
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // ✅ Common static file extensions
      {
        source: "/:path*.(jpg|jpeg|png|gif|webp|avif|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.(mp4|webm|ogg|mp3|wav)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.(pdf|doc|docx)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];

    // Long-lived caching is for production only. In development the file
    // names don't change between edits, so an immutable cache makes the
    // browser keep serving old CSS/JS.
    return isDev
      ? rules.filter(
          (rule) => !rule.headers.some((h) => h.key === "Cache-Control"),
        )
      : rules;
  },
};

export default nextConfig;

// export default withAxiom(nextConfig);
