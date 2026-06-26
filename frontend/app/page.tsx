import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/button'
import { Card } from '@/components/card'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-background px-4 py-6 text-brand-foreground sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <section className="space-y-4 rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-10">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-600">SpeedService</p>
            <h1 className="text-3xl font-semibold sm:text-5xl">Plateforme de livraison rapide</h1>
            <p className="max-w-2xl text-gray-700">
              Une interface moderne pour gérer les livraisons, la logistique et le suivi client.
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Button className="w-full sm:w-auto">Commencer</Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
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

        <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-700">Next Steps</p>
              <h2 className="text-2xl font-semibold">Configurer l’authentification</h2>
            </div>
            <Button variant="secondary" className="inline-flex w-full items-center gap-2 sm:w-auto">
              Continuer <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
