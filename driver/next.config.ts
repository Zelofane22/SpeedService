import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Requis par driver/Dockerfile (stage runner : COPY .next/standalone)
  output: 'standalone',
  // Monorepo pnpm : trace les dépendances depuis la racine du workspace,
  // sinon le standalone embarque des symlinks pnpm cassés (Cannot find module 'next')
  outputFileTracingRoot: path.join(__dirname, '..'),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  },
}

export default nextConfig
