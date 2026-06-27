import Card from '@/components/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
      </div>

      <div className="max-w-3xl">
        <Card className="p-6">
          <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Apparence
              </h2>
            </div>

            <div className="w-full sm:w-72">
              <ThemeToggle />
            </div>
          </section>
        </Card>
      </div>
    </div>
  )
}
