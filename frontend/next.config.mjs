import path from 'node:path'
import { fileURLToPath } from 'node:url'

const nextConfig = {
  reactStrictMode: true,
  // Requis par frontend/Dockerfile (stage runner : COPY .next/standalone)
  output: 'standalone',
  // Monorepo pnpm : trace les dépendances depuis la racine du workspace,
  // sinon le standalone embarque des symlinks pnpm cassés (Cannot find module 'next')
  outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
}

export default nextConfig
