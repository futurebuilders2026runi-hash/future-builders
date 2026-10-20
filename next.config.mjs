/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep browser-test builds separate from a developer's running server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
