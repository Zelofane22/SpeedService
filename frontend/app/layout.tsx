export const metadata = {
  title: {
    default: 'SpeedService - Livraison rapide au Benin',
    template: '%s | SpeedService',
  },
  description:
    'Commandez une livraison rapide au Benin avec suivi en ligne, paiement mobile money et livreurs disponibles a Cotonou, Porto-Novo et dans les principales villes.',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'SpeedService - Livraison rapide au Benin',
    description:
      'Livraison standard, express et solutions entreprise avec suivi et paiement securise.',
    url: 'https://speedservice.bj',
    siteName: 'SpeedService',
    locale: 'fr_BJ',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SpeedService - Livraison rapide au Benin',
    description:
      'Envoyez vos colis au Benin avec suivi en ligne et paiement mobile money.',
  },
}

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
      </body>
    </html>
  )
}
