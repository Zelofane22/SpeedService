import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Centre d’aide',
  description: 'Aide SpeedService pour commandes, paiements et suivi de livraison.',
}

export default function HelpPage() {
  return (
    <PublicPage
      title="Centre d’aide"
      subtitle="Les reponses essentielles pour commander, payer, suivre ou corriger une livraison SpeedService."
      sections={[
        { title: 'Suivre une commande', body: 'Connectez-vous a votre espace client pour consulter le statut et les details de chaque livraison.' },
        { title: 'Modifier une adresse', body: 'Contactez le support rapidement si la commande n’a pas encore ete collectee par un livreur.' },
        { title: 'Paiement en attente', body: 'Les paiements en especes, agence ou validation manuelle peuvent rester en attente jusqu’a confirmation administrateur.' },
        { title: 'Probleme de livraison', body: 'Preparez le numero de commande, le telephone client et le telephone destinataire pour accelerer le traitement.' },
      ]}
      cta="Ouvrir mon espace"
    />
  )
}
