import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Actualites et conseils livraison par SpeedService.',
}

export default function BlogPage() {
  return (
    <PublicPage
      title="Blog SpeedService"
      subtitle="Conseils pratiques pour mieux preparer vos colis, choisir le bon mode de livraison et suivre vos commandes."
      sections={[
        { title: 'Bien emballer un colis', body: 'Protegez les objets fragiles, indiquez clairement les coordonnees et choisissez un format adapte au transport.' },
        { title: 'Choisir Standard ou Express', body: 'Le standard convient aux envois planifies. L’express est recommande pour les livraisons urgentes dans une zone couverte.' },
        { title: 'Paiement mobile money', body: 'MTN MoMo et Moov Money facilitent la validation rapide de la commande et le suivi du paiement.' },
        { title: 'Suivi par statut', body: 'Chaque commande passe par des etapes lisibles : validation, assignation, collecte, livraison et confirmation.' },
      ]}
    />
  )
}
