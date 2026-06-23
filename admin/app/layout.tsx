import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeToggle } from '@/components/theme-toggle'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SpeedService Admin',
  description: 'Back-office SpeedService',
}

const themeScript = `
  (function () {
    var savedTheme = null;
    try {
      savedTheme = localStorage.getItem('speedservice-theme');
    } catch (_) {}
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        {children}
        <ThemeToggle />
      </body>
    </html>
  )
}
