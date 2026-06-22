export const metadata = {
  title: 'SpeedService',
  description: 'SpeedService frontend',
}

import './globals.css'
import { ThemeToggle } from '@/components/theme-toggle'

const themeScript = `
  (function () {
    try {
      var savedTheme = localStorage.getItem('speedservice-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    } catch (_) {}
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
      <body>
        {children}
        <ThemeToggle />
      </body>
    </html>
  )
}
