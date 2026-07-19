import type { Metadata } from 'next'
import { PublicPage } from '../public-page'

export const metadata: Metadata = {
  title: 'Politique de confidentialite',
  description: 'Politique de confidentialite SpeedService et traitement des donnees clients.',
}

export default function PrivacyPage() {
  return (
    <PublicPage
      title="Politique de confidentialite"
      subtitle="Cette page resume les donnees necessaires au fonctionnement du service et les principes appliques pour les proteger."
      sections={[
        {
          title: 'Donnees collectees',
          body: 'Nous collectons les informations utiles a la livraison : identite, telephone, adresses de collecte et destination, details du colis, paiement et historique de commande.',
        },
        {
          title: 'Utilisation',
          body: 'Ces donnees servent a creer la commande, affecter un livreur, suivre les statuts, contacter le client ou le destinataire et produire les justificatifs de paiement.',
        },
        {
          title: 'Conservation',
          body: 'Les informations sont conservees pendant la duree necessaire au suivi operationnel, comptable, support et obligations legales applicables.',
        },
        {
          title: 'Droits',
          body: 'Vous pouvez demander l’acces, la correction ou la suppression de vos donnees en contactant l’equipe SpeedService depuis la page Contact.',
        },
      ]}
      cta="Creer un compte"
    />
  )
}
