export default function ConfidentialitePage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-4">Politique de confidentialité</h1>
      <p>
        Cette application respecte la vie privée de ses utilisateurs et s'engage à protéger leurs données personnelles conformément au RGPD.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Données collectées</h2>
      <ul className="list-disc pl-6">
        <li>Adresse email, pseudo, paramètres utilisateur, collection Pokémon</li>
        <li>Aucune donnée bancaire n'est stockée : les paiements sont gérés par Stripe</li>
        <li>Les emails transactionnels sont envoyés via Resend</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">Utilisation des données</h2>
      <ul className="list-disc pl-6">
        <li>Gestion de votre compte et de votre collection</li>
        <li>Envoi d'emails de confirmation ou d'information liés à votre compte</li>
        <li>Amélioration du service (statistiques anonymes, jamais de revente)</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">Suppression des données</h2>
      <p>
        Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis la page paramètres.  
        Pour toute demande d'accès, de rectification ou de suppression, contactez-nous à <a href="mailto:contact@pokemon-collection.app" className="underline">contact@pokemon-collection.app</a>.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Sécurité</h2>
      <p>
        Vos données sont stockées de façon sécurisée et ne sont jamais partagées ni revendues à des tiers.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Cookies</h2>
      <p>
        Nous n'utilisons pas de cookies de tracking. Seuls des cookies techniques sont utilisés pour la connexion et le bon fonctionnement du site.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2">Sous-traitants</h2>
      <ul className="list-disc pl-6">
        <li>Stripe (paiement sécurisé)</li>
        <li>Resend (envoi d'emails transactionnels)</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
      <p>
        Pour toute question ou demande relative à vos données personnelles, contactez-nous à <a href="mailto:contact@pokemon-collection.app" className="underline">contact@pokemon-collection.app</a>.
      </p>
    </div>
  )
} 