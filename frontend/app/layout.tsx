export const metadata = {
  title: 'SpeedService',
  description: 'SpeedService frontend',
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
