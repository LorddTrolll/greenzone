/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações do Next.js
  experimental: {
    serverMinification: false
  },
  // Configuração para resolver problemas de build na Vercel
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.minimize = false
    }
    return config
  }
}

module.exports = nextConfig