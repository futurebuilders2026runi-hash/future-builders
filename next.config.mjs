/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build/test processes must not overwrite a running development manifest.
  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === "development" ? ".next-local" : ".next"),
};

export default nextConfig;
