import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-background px-6 py-8 text-brand-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="space-y-4 rounded-[2rem] border border-brand-border bg-white p-10 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-600">SpeedService</p>
            <h1 className="text-4xl font-semibold sm:text-5xl">Plateforme de livraison rapide</h1>
            <p className="max-w-2xl text-gray-700">
              Une interface moderne pour gérer les livraisons, la logistique et le suivi client.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button>Commencer</Button>
            <Button variant="outline" size="lg">
              En savoir plus
            </Button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <Card.Header>
              <Card.Title>Infrastructure</Card.Title>
              <Card.Description>Next.js, Tailwind CSS et shadcn UI prêts à l&apos;emploi.</Card.Description>
            </Card.Header>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title>Design system</Card.Title>
              <Card.Description>Composable components et styles utilitaires pour le frontend.</Card.Description>
            </Card.Header>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title>Prêt pour l’avenir</Card.Title>
              <Card.Description>Configuration optimisée pour le build et le développement local.</Card.Description>
            </Card.Header>
          </Card>
        </div>

        <div className="rounded-[2rem] border border-brand-border bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-700">Next Steps</p>
              <h2 className="text-2xl font-semibold">Configurer l’authentification</h2>
            </div>
            <Button variant="secondary" className="inline-flex items-center gap-2">
              Continuer <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
