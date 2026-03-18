/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.webshopapp.com",
        pathname: "/shops/**",
      },
    ],
  },
};

module.exports = nextConfig
