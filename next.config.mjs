/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || "";

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  poweredByHeader: false,
  trailingSlash: true,
  agentRules: false,
  ...(basePath ? { basePath } : {})
};

export default nextConfig;
