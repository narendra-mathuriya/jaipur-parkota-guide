/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  poweredByHeader: false,
  trailingSlash: true
};

export default nextConfig;
