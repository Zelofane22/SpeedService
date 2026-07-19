import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Partenaires',
  description: 'Solutions partenaires et entreprise SpeedService.',
}

export default function PartnersPage() {
  return (
    <PublicPage
      title="Partenaires"
      subtitle="SpeedService accompagne les commercants, plateformes, boutiques et services qui veulent fiabiliser leurs livraisons."
      sections={[
        { title: 'Marchands', body: 'Un parcours simple pour expedier les commandes clients avec suivi et paiement adapte.' },
        { title: 'Plateformes', body: 'Des options API et un suivi centralise pour integrer la livraison dans vos outils metier.' },
        { title: 'Points relais', body: 'Des collaborations locales peuvent etre mises en place selon la zone et le volume de commandes.' },
        { title: 'Accompagnement', body: 'L’equipe SpeedService peut construire une proposition adaptee a votre rythme, vos zones et vos contraintes.' },
      ]}
      cta="Demander un devis"
    />
  )
}
