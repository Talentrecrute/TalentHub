import { Card, CardContent } from "@/components/ui/card"
import { getTranslations } from 'next-intl/server'

export default async function PrivacyPage() {
  const t = await getTranslations('legal')

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Politique de Confidentialité</h1>
        
        <Card>
          <CardContent className="p-8 prose prose-slate max-w-none">
            <p className="lead text-lg text-slate-600 mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h3>1. Introduction</h3>
            <p>
              Bienvenue sur OceanicJob. Nous respectons votre vie privée et nous engageons à protéger vos données personnelles. 
              Cette politique de confidentialité vous informera sur la manière dont nous traitons vos données personnelles 
              lorsque vous visitez notre site web et vous informera de vos droits en matière de confidentialité.
            </p>

            <h3>2. Les données que nous collectons</h3>
            <p>
              Nous pouvons collecter, utiliser, stocker et transférer différents types de données personnelles vous concernant :
            </p>
            <ul>
              <li><strong>Données d'identité :</strong> prénom, nom, nom d'utilisateur.</li>
              <li><strong>Données de contact :</strong> adresse email, numéro de téléphone, adresse postale.</li>
              <li><strong>Données techniques :</strong> adresse IP, type de navigateur, fuseau horaire, localisation.</li>
              <li><strong>Données de profil :</strong> vos intérêts, préférences, retours et réponses aux enquêtes.</li>
              <li><strong>Données d'usage :</strong> informations sur la façon dont vous utilisez notre site web et nos services.</li>
            </ul>

            <h3>3. Comment nous utilisons vos données</h3>
            <p>
              Nous n'utiliserons vos données personnelles que lorsque la loi nous y autorise. Le plus souvent, nous utiliserons vos données personnelles dans les circonstances suivantes :
            </p>
            <ul>
              <li>Pour exécuter le contrat que nous sommes sur le point de conclure ou que nous avons conclu avec vous.</li>
              <li>Lorsque cela est nécessaire pour nos intérêts légitimes.</li>
              <li>Lorsque nous devons nous conformer à une obligation légale ou réglementaire.</li>
            </ul>

            <h3>4. Sécurité des données</h3>
            <p>
              Nous avons mis en place des mesures de sécurité appropriées pour empêcher que vos données personnelles ne soient 
              accidentellement perdues, utilisées ou consultées de manière non autorisée, modifiées ou divulguées.
            </p>

            <h3>5. Vos droits légaux</h3>
            <p>
              Dans certaines circonstances, vous avez des droits en vertu des lois sur la protection des données concernant vos données personnelles, notamment :
            </p>
            <ul>
              <li>Demander l'accès à vos données personnelles.</li>
              <li>Demander la correction de vos données personnelles.</li>
              <li>Demander l'effacement de vos données personnelles.</li>
              <li>S'opposer au traitement de vos données personnelles.</li>
              <li>Demander la restriction du traitement de vos données personnelles.</li>
              <li>Demander le transfert de vos données personnelles.</li>
              <li>Droit de retirer votre consentement.</li>
            </ul>

            <h3>6. Cookies</h3>
            <p>
              Vous pouvez configurer votre navigateur pour refuser tout ou partie des cookies de navigateur, ou pour vous alerter 
              lorsque des sites web définissent ou accèdent à des cookies. Si vous désactivez ou refusez les cookies, veuillez noter 
              que certaines parties de ce site web peuvent devenir inaccessibles ou ne pas fonctionner correctement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
