import Link from 'next/link'
import {
  Truck, MapPin, Clock, Star, Phone, Mail,
  ArrowRight, Check, User, CheckCircle, Shield, Zap, Globe,
  PlusCircle, CreditCard, Package,
} from 'lucide-react'
import { Logo } from '@/components/logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-background">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '#', label: 'Accueil' },
              { href: '#services', label: 'Services' },
              { href: '#tarifs', label: 'Tarifs' },
              { href: '#contact', label: 'Contact' },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all text-gray-500 hover:text-brand-foreground hover:bg-brand-muted/50"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl bg-primary text-white hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 px-4 py-2 text-sm"
          >
            Connexion
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary via-[#9E2480] to-secondary min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                opacity: 0.3 + (i % 5) * 0.1,
              }}
            />
          ))}
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full text-sm font-medium mb-8">
              <Zap size={14} /> Livraison en 2h dans Cotonou
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Livrez vos colis<br />rapidement partout<br />
              <span className="text-white/70">au Bénin</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-md">
              Commande en ligne, suivi par statut et paiement sécurisé. MTN MoMo &amp; Moov Money acceptés.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-white/90 transition-all shadow-2xl"
              >
                Commander maintenant <ArrowRight size={18} />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 font-semibold rounded-2xl border-2 border-white/40 text-white bg-transparent hover:bg-white/10 active:scale-[0.98] transition-all px-8 py-4 text-base"
              >
                Demander un devis
              </a>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Package size={120} className="text-white/60" />
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-foreground">
                  <CheckCircle size={16} className="text-green-500" /> Livré !
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-foreground">
                  <Truck size={16} className="text-primary" /> En route
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: '50 000+', l: 'Colis livrés' },
            { n: '12', l: 'Villes couvertes' },
            { n: '98%', l: 'Satisfaction client' },
            { n: '2h', l: 'Délai express' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-extrabold text-primary">{s.n}</p>
              <p className="text-sm text-gray-500 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why us ───────────────────────────────────────────────────────── */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4 text-brand-foreground">Pourquoi nous choisir ?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Speed Service offre la solution de livraison la plus fiable et rapide du Bénin.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: 'Livraison rapide', desc: 'Express en 2h, standard en 24h. Nous respectons les délais.' },
            { icon: MapPin, title: 'Suivi simplifié', desc: 'Suivez l\'avancement de votre colis à chaque étape : confirmé, récupéré, en livraison, livré.' },
            { icon: Shield, title: 'Paiement sécurisé', desc: 'MTN MoMo, Moov Money et carte bancaire acceptés.' },
            { icon: Star, title: 'Service premium', desc: 'Support client disponible 7j/7 de 7h à 22h.' },
          ].map(f => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-brand-border shadow-sm p-6 hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary flex items-center justify-center mb-5 transition-colors">
                <f.icon size={22} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold mb-2 text-brand-foreground">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-brand-muted/30 to-brand-background py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4 text-brand-foreground">Comment ça marche ?</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
            {[
              { n: '01', icon: PlusCircle, title: 'Créez votre commande', desc: 'Renseignez expéditeur, destinataire et détails du colis.' },
              { n: '02', icon: CreditCard, title: 'Payez en ligne', desc: 'Paiement sécurisé via MTN MoMo ou Moov Money.' },
              { n: '03', icon: Truck, title: 'On collecte votre colis', desc: 'Un livreur vient récupérer votre colis à domicile.' },
              { n: '04', icon: CheckCircle, title: 'Livraison confirmée', desc: 'Le destinataire reçoit son colis, vous êtes notifié.' },
            ].map(s => (
              <div key={s.n} className="text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
                  <s.icon size={28} className="text-white" />
                </div>
                <span className="text-xs font-bold text-primary/50 tracking-widest">{s.n}</span>
                <h3 className="font-semibold mt-1 mb-2 text-brand-foreground">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4 text-brand-foreground">Ce que disent nos clients</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Koffi Mensah', city: 'Cotonou', rating: 5, text: 'Service incroyable ! Mon colis est arrivé en 1h30. Je recommande Speed Service à tous mes amis commerçants.' },
            { name: 'Aïcha Bah', city: 'Cotonou', rating: 5, text: 'Le suivi par statut est très pratique. Je sais exactement où en est ma livraison à chaque étape.' },
            { name: 'Yves Dossou', city: 'Porto-Novo', rating: 4, text: 'Très professionnel, tarifs compétitifs. L\'application est facile à utiliser. Je suis client fidèle depuis 6 mois.' },
          ].map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-brand-border shadow-sm p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5 text-brand-foreground">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-foreground">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section id="tarifs" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-secondary p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à envoyer votre premier colis ?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Rejoignez plus de 10 000 clients qui font confiance à Speed Service chaque mois.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-white/90 transition-all shadow-2xl"
          >
            Commencer maintenant <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-brand-foreground text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Package size={16} className="text-white" />
              </div>
              <span>Speed<span className="text-white/70">Service</span></span>
            </div>
            <p className="text-white/50 text-sm mt-4 leading-relaxed">
              Votre partenaire livraison de confiance au Bénin.
            </p>
          </div>
          {[
            { title: 'Services', links: ['Livraison Standard', 'Livraison Express', 'API Entreprise', 'Tarifs'] },
            { title: 'Entreprise', links: ['À propos', 'Carrières', 'Blog', 'Partenaires'] },
            { title: 'Support', links: ['Centre d\'aide', 'Contact', 'Politique', 'CGU'] },
          ].map(g => (
            <div key={g.title}>
              <h4 className="font-semibold mb-4 text-sm text-white/60 tracking-wider uppercase">{g.title}</h4>
              <ul className="space-y-2">
                {g.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-white/40 text-xs">© 2024 Speed Service. Tous droits réservés.</p>
          <p className="text-white/40 text-xs">Cotonou, Bénin · +229 97 00 00 00</p>
        </div>
      </footer>

    </div>
  )
}
