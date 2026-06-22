import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#FAF7FB]">
      {/* Header */}
      <header className="bg-[#861D6D] text-white px-6 py-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">S</div>
        <span className="font-semibold text-lg">SpeedService Rider</span>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 gap-6">
        <div className="w-20 h-20 bg-[#861D6D] rounded-full flex items-center justify-center text-white text-3xl">
          🛵
        </div>
        <h1 className="text-2xl font-bold text-[#1D1D1F] leading-tight">
          Rejoignez notre réseau<br />de livreurs au Bénin
        </h1>
        <p className="text-gray-600 max-w-xs leading-relaxed">
          Travaillez à votre rythme, choisissez vos missions et gagnez en toute flexibilité avec SpeedService.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <Link
            href="/apply"
            className="w-full bg-[#861D6D] text-white py-4 rounded-xl font-semibold text-center text-lg shadow-md active:scale-95 transition-transform"
          >
            Devenir livreur
          </Link>
          <Link
            href="/apply/status"
            className="w-full border-2 border-[#861D6D] text-[#861D6D] py-4 rounded-xl font-semibold text-center active:scale-95 transition-transform"
          >
            Suivre ma candidature
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-10 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: '⚡', label: 'Missions rapides' },
          { icon: '💰', label: 'Paiement express' },
          { icon: '📍', label: 'Partout au Bénin' },
        ].map(({ icon, label }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-xs text-gray-600 font-medium">{label}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-6">
        <Link href="/login" className="text-[#861D6D] font-medium">
          J&apos;ai déjà un compte livreur →
        </Link>
      </footer>
    </main>
  )
}
