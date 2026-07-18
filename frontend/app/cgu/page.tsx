import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Conditions generales',
  description: 'Conditions generales d’utilisation du service SpeedService.',
}

export default function TermsPage() {
  return (
    <PublicPage
      title="Conditions generales d’utilisation"
      subtitle="Les conditions ci-dessous cadrent l’utilisation de SpeedService par les clients, livreurs et partenaires."
      sections={[
        {
          title: 'Creation de commande',
          body: 'Le client renseigne des informations exactes sur le colis, les adresses, le destinataire et les contraintes de livraison avant validation.',
        },
        {
          title: 'Paiement',
          body: 'Les paiements mobile money, carte, agence ou paiement a la livraison suivent les regles affichees lors de la commande. Certains modes demandent une validation administrateur.',
        },
        {
          title: 'Colis interdits',
          body: 'Les produits dangereux, illicites, perissables non declares ou non transportables peuvent etre refuses ou annules par SpeedService.',
        },
        {
          title: 'Responsabilites',
          body: 'SpeedService organise la livraison et le suivi. Le client reste responsable de l’exactitude des informations et de la conformite du contenu envoye.',
        },
      ]}
      cta="Commander maintenant"
    />
  )
}
