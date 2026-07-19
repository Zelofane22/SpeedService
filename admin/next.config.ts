import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Monorepo pnpm : trace les dépendances depuis la racine du workspace,
  // sinon le standalone embarque des symlinks pnpm cassés (Cannot find module 'next')
  outputFileTracingRoot: path.join(__dirname, '..'),
}

export default nextConfig
