/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  poweredByHeader: false,
  trailingSlash: true,
  agentRules: false
};

export default nextConfig;
