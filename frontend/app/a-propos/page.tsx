import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'A propos',
  description: 'Decouvrir la mission de SpeedService au Benin.',
}

export default function AboutPage() {
  return (
    <PublicPage
      title="A propos de SpeedService"
      subtitle="SpeedService simplifie la livraison locale au Benin avec une experience claire pour les clients, livreurs et equipes d’operation."
      sections={[
        { title: 'Notre mission', body: 'Rendre l’envoi de colis plus fiable, plus rapide et plus transparent pour les particuliers comme pour les professionnels.' },
        { title: 'Notre terrain', body: 'Nous construisons le service autour des usages de Cotonou et des grandes villes du Benin : mobile money, suivi simple et support reactif.' },
        { title: 'Notre promesse', body: 'Des informations claires, des statuts lisibles et une equipe operationnelle qui garde le client informe jusqu’a la livraison.' },
        { title: 'Nos equipes', body: 'SpeedService relie clients, administrateurs et livreurs dans une plateforme unique, concue pour la stabilite et le deploiement.' },
      ]}
    />
  )
}
