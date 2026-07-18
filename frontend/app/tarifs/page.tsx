import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Tarifs',
  description: 'Tarifs SpeedService pour les livraisons standard, express et entreprise au Benin.',
}

export default function PricingPage() {
  return (
    <PublicPage
      title="Tarifs SpeedService"
      subtitle="Choisissez le niveau de service adapte a votre colis. Le prix final est confirme avant paiement selon la distance, le volume et la ville de livraison."
      sections={[
        {
          id: 'standard',
          title: 'Standard - des 1 500 FCFA',
          body: 'Livraison planifiee sous 24h a Cotonou pour les colis courants. Ideal pour les envois non urgents et les commandes recurrentes.',
        },
        {
          id: 'express',
          title: 'Express - des 2 500 FCFA',
          body: 'Priorite de collecte et livraison ciblee en 2h lorsque la zone et la disponibilite livreur le permettent.',
        },
        {
          title: 'Interurbain',
          body: 'Les trajets vers Porto-Novo, Abomey-Calavi, Parakou et les autres villes sont calcules selon la distance et le type de colis.',
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
