import Link from 'next/link'
import { ArrowLeft, ArrowRight, Package } from 'lucide-react'
import { Logo } from '@/components/logo'

type PublicPageProps = {
  title: string
  subtitle: string
  sections: Array<{
    id?: string
    title: string
    body: string
  }>
  cta?: string
}

export function PublicPage({ title, subtitle, sections, cta = 'Créer une livraison' }: PublicPageProps) {
  return (
    <main className="min-h-screen bg-brand-background">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <ArrowLeft size={16} />
            Accueil
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-3xl">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Package size={22} className="text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-brand-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-700">{subtitle}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {sections.map(section => (
            <article
              key={section.title}
              id={section.id}
              className="scroll-mt-24 rounded-2xl border border-brand-border bg-white p-6"
            >
              <h2 className="text-lg font-bold text-brand-foreground">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            {cta}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-2xl border border-brand-border bg-white px-5 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-muted"
          >
            Contacter l’equipe
          </Link>
        </div>
      </section>
    </main>
  )
}
