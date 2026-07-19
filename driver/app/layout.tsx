import type { Metadata, Viewport } from 'next'
import './globals.css'

const themeScript = `
  (function () {
    var savedTheme = null;
    try {
      savedTheme = localStorage.getItem('speedservice-theme');
    } catch (_) {}
    var isDark = savedTheme === 'dark';
    if (savedTheme !== 'dark' && savedTheme !== 'light') {
      try {
        localStorage.setItem('speedservice-theme', 'light');
      } catch (_) {}
    }
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  })();
`

export const metadata: Metadata = {
  title: {
    default: 'SpeedService Driver',
    template: '%s · SpeedService Driver',
  },
  description: 'Devenez livreur SpeedService au Bénin',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'SS Driver' },
}

export const viewport: Viewport = {
  themeColor: '#861D6D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[#FAF7FB] text-[#1D1D1F] [.dark_&]:bg-[#101114] [.dark_&]:text-gray-100">
        {children}
      </body>
    </html>
  )
}
