import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || "";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emptyModernPolyfills = path.join(__dirname, "lib/empty-modern-polyfills.cjs");

const modernPolyfillAliasKeys = [
  "../build/polyfills/polyfill-module",
  "next/dist/build/polyfills/polyfill-module",
  "next/dist/build/polyfills/polyfill-module.js"
];

const turbopackModernPolyfillAliases = Object.fromEntries(
  modernPolyfillAliasKeys.map((key) => [key, "./lib/empty-modern-polyfills.cjs"])
);

const webpackModernPolyfillAliases = Object.fromEntries(
  modernPolyfillAliasKeys.map((key) => [key, emptyModernPolyfills])
);

const applyWebpackModernPolyfillAliases = (config) => {
  config.resolve ??= {};
  config.resolve.alias ??= {};
  Object.assign(config.resolve.alias, webpackModernPolyfillAliases);
};

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  poweredByHeader: false,
  trailingSlash: true,
  agentRules: false,
  turbopack: {
    resolveAlias: turbopackModernPolyfillAliases
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      applyWebpackModernPolyfillAliases(config);
    }

    return config;
  },
  ...(basePath ? { basePath } : {})
};

export default nextConfig;
