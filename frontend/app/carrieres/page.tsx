import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Carrieres',
  description: 'Opportunites et candidatures chez SpeedService.',
}

export default function CareersPage() {
  return (
    <PublicPage
      title="Carrieres"
      subtitle="SpeedService grandit avec des profils operationnels, support, produit et livraison qui connaissent le terrain beninois."
      sections={[
        { title: 'Operations', body: 'Coordination des commandes, affectation livreurs, resolution des incidents et qualite de service.' },
        { title: 'Support client', body: 'Accompagnement des clients et destinataires avec des reponses rapides, precises et humaines.' },
        { title: 'Livreurs partenaires', body: 'Les livreurs disposent d’un espace dedie pour gerer leur candidature et leurs missions.' },
        { title: 'Candidature spontanee', body: 'Envoyez votre profil via la page Contact en precisant la ville, le role souhaite et vos disponibilites.' },
      ]}
      cta="Devenir client"
    />
  )
}
