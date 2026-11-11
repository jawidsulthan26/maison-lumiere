/** @type {import('next').NextConfig} */
const nextConfig = {
  // the home engine mutates its own DOM once after mount; double-invoked dev effects would split text twice
  reactStrictMode: false,
};
export default nextConfig;
