/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  webpack: (config) => {
    config.externals.push({ "utf-8-validate": "commonjs utf-8-validate", bufferutil: "commonjs bufferutil" });
    return config;
  },
};
export default nextConfig;
