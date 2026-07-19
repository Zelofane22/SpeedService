import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Tarifs',
  description: 'Tarifs SpeedService a 200 FCFA par kilometre entre collecte et livraison au Benin.',
}

export default function PricingPage() {
  return (
    <PublicPage
      title="Tarifs SpeedService"
      subtitle="Le prix de livraison est calcule a 200 FCFA par kilometre entre le point de collecte et le destinataire, puis confirme avant paiement."
      sections={[
        {
          id: 'standard',
          title: 'Standard - 200 FCFA/km',
          body: 'Livraison planifiee sous 24-48 h. Le montant depend uniquement de la distance entre l\'emetteur et le destinataire.',
        },
        {
          id: 'express',
          title: 'Express - 200 FCFA/km',
          body: 'Priorite de collecte et livraison ciblee en 2-4 h lorsque la zone et la disponibilite livreur le permettent.',
        },
        {
          title: 'Interurbain',
          body: 'Les trajets vers Porto-Novo, Abomey-Calavi, Parakou et les autres villes restent calcules selon la distance exacte de livraison.',
        },
        {
          id: 'entreprise',
          title: 'Entreprise et API',
          body: 'Tarification sur devis pour les marchands, pharmacies, restaurants et plateformes qui ont besoin de volumes reguliers ou d’une integration API.',
        },
      ]}
      cta="Estimer une livraison"
    />
  )
}
