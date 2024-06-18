/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "special-orbit-5gq94wwpj7pfvwg4-3001.app.github.dev",
        "localhost:3001",
      ],
      missingSuspenseWithCSRBailout: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dycyoogjkrsr2moy.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
