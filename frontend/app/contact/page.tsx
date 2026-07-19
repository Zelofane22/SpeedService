import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contacter SpeedService pour une livraison, un devis ou le support.',
}

export default function ContactPage() {
  return (
    <PublicPage
      title="Contact"
      subtitle="Une question sur une livraison, un partenariat ou un paiement ? Contactez l’equipe SpeedService."
      sections={[
        { title: 'Telephone', body: '+229 01 97 00 00 00. Disponible pour les demandes operationnelles et le suivi client.' },
        { title: 'Email', body: 'contact@speedservice.bj pour les demandes commerciales, partenariats et questions generales.' },
        { title: 'Support', body: 'Pour une commande existante, indiquez le numero de livraison et le telephone utilise lors de la creation.' },
        { title: 'Adresse', body: 'Cotonou, Benin. Les horaires support couvrent les operations courantes de livraison.' },
      ]}
      cta="Creer une livraison"
    />
  )
}
