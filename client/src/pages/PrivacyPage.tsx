import { useTranslation } from '../i18n';
import { Shield, Eye, Database, Lock, Cookie, UserX, Mail, Globe } from 'lucide-react';

export default function PrivacyPage() {
  const { lang } = useTranslation();
  const isPl = lang === 'pl';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isPl ? 'Polityka Prywatnosci' : 'Privacy Policy'}
        </h1>
        <p className="text-sm text-gray-500">
          {isPl ? 'Ostatnia aktualizacja: 6 lutego 2026' : 'Last updated: February 6, 2026'}
        </p>
      </div>

      <div className="space-y-8">
        {/* 1 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            {isPl ? '1. Administrator danych osobowych' : '1. Data controller'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Administratorem danych osobowych jest Vipile. W sprawach zwiazanych z ochrona danych osobowych mozna kontaktowac sie pod adresem: kontakt@vipile.pl'
              : 'The data controller is Vipile. For matters related to personal data protection, contact: kontakt@vipile.pl'}</p>
          </div>
        </section>

        {/* 2 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            {isPl ? '2. Jakie dane zbieramy' : '2. What data we collect'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl ? 'Zbieramy nastepujace dane:' : 'We collect the following data:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Adres e-mail (wymagany do rejestracji i logowania)' : 'Email address (required for registration and login)'}</li>
              <li>{isPl ? 'Imie / pseudonim (wyswietlane publicznie)' : 'Name / nickname (displayed publicly)'}</li>
              <li>{isPl ? 'Numer telefonu (opcjonalny, wyswietlany w ogloszeniach)' : 'Phone number (optional, displayed in listings)'}</li>
              <li>{isPl ? 'Miasto / lokalizacja (wyswietlane w ogloszeniach)' : 'City / location (displayed in listings)'}</li>
              <li>{isPl ? 'Zdjecie profilowe (opcjonalne)' : 'Profile picture (optional)'}</li>
              <li>{isPl ? 'Tresc ogloszen i wiadomosci' : 'Listing content and messages'}</li>
              <li>{isPl ? 'Adres IP i dane techniczne przegladarki' : 'IP address and browser technical data'}</li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-500" />
            {isPl ? '3. Cel przetwarzania danych' : '3. Purpose of data processing'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl ? 'Dane sa przetwarzane w celu:' : 'Data is processed for:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Swiadczenia uslugi ogloszen internetowych (art. 6 ust. 1 lit. b RODO)' : 'Providing the online classifieds service (Art. 6(1)(b) GDPR)'}</li>
              <li>{isPl ? 'Zapewnienia bezpieczenstwa i przeciwdzialania naduzuciom (art. 6 ust. 1 lit. f RODO)' : 'Ensuring security and preventing abuse (Art. 6(1)(f) GDPR)'}</li>
              <li>{isPl ? 'Komunikacji z uzytkownikami (art. 6 ust. 1 lit. b RODO)' : 'Communication with users (Art. 6(1)(b) GDPR)'}</li>
              <li>{isPl ? 'Wysylania newslettera (art. 6 ust. 1 lit. a RODO - zgoda)' : 'Sending newsletters (Art. 6(1)(a) GDPR - consent)'}</li>
              <li>{isPl ? 'Realizacji obowiazkow prawnych (art. 6 ust. 1 lit. c RODO)' : 'Fulfilling legal obligations (Art. 6(1)(c) GDPR)'}</li>
            </ul>
          </div>
        </section>

        {/* 4 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            {isPl ? '4. Udostepnianie danych' : '4. Data sharing'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                {isPl
                  ? 'Publikujac ogloszenie, uzytkownik dobrowolnie udostepnia swoje dane (imie, miasto, telefon, zdjecia) wszystkim odwiedzajacym Serwis. Vipile nie ponosi odpowiedzialnosci za wykorzystanie tych danych przez osoby trzecie.'
                  : 'By publishing a listing, the user voluntarily shares their data (name, city, phone, photos) with all Service visitors. Vipile bears no responsibility for third-party use of this data.'}
              </p>
            </div>
            <p>{isPl ? 'Dane moga byc udostepniane:' : 'Data may be shared with:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Operatorowi platnosci (Stripe) - w przypadku uslug platnych' : 'Payment operator (Stripe) - for paid services'}</li>
              <li>{isPl ? 'Dostawcom uslug hostingowych i infrastrukturalnych' : 'Hosting and infrastructure service providers'}</li>
              <li>{isPl ? 'Organom scigania - na podstawie obowiazujacych przepisow prawa' : 'Law enforcement - based on applicable legal provisions'}</li>
            </ul>
          </div>
        </section>

        {/* 5 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            {isPl ? '5. Bezpieczenstwo danych' : '5. Data security'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Stosujemy odpowiednie srodki techniczne i organizacyjne w celu ochrony danych osobowych:'
              : 'We apply appropriate technical and organizational measures to protect personal data:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Szyfrowanie transmisji danych (SSL/TLS)' : 'Data transmission encryption (SSL/TLS)'}</li>
              <li>{isPl ? 'Hashowanie hasel (bcrypt)' : 'Password hashing (bcrypt)'}</li>
              <li>{isPl ? 'Tokeny JWT z ograniczonym czasem waznosci' : 'JWT tokens with limited validity'}</li>
              <li>{isPl ? 'Regularne kopie zapasowe bazy danych' : 'Regular database backups'}</li>
            </ul>
          </div>
        </section>

        {/* 6 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-500" />
            {isPl ? '6. Pliki cookies' : '6. Cookies'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Serwis wykorzystuje pliki cookies (ciasteczka) w celu:'
              : 'The Service uses cookies for:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Utrzymania sesji uzytkownika (logowanie)' : 'Maintaining user session (login)'}</li>
              <li>{isPl ? 'Zapamietywania preferencji (jezyk, tryb ciemny)' : 'Remembering preferences (language, dark mode)'}</li>
              <li>{isPl ? 'Poprawy dzialania Serwisu' : 'Improving Service performance'}</li>
            </ul>
            <p>{isPl
              ? 'Uzytkownik moze zarzadzac plikami cookies w ustawieniach przegladarki.'
              : 'Users can manage cookies in their browser settings.'}</p>
          </div>
        </section>

        {/* 7 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserX className="w-5 h-5 text-orange-500" />
            {isPl ? '7. Prawa uzytkownika' : '7. User rights'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl ? 'Zgodnie z RODO uzytkownicy maja prawo do:' : 'Under GDPR, users have the right to:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Dostepu do swoich danych osobowych' : 'Access their personal data'}</li>
              <li>{isPl ? 'Sprostowania nieprawidlowych danych' : 'Rectification of inaccurate data'}</li>
              <li>{isPl ? 'Usuniecia danych ("prawo do bycia zapomnianym")' : 'Erasure of data ("right to be forgotten")'}</li>
              <li>{isPl ? 'Ograniczenia przetwarzania' : 'Restriction of processing'}</li>
              <li>{isPl ? 'Przenoszenia danych' : 'Data portability'}</li>
              <li>{isPl ? 'Sprzeciwu wobec przetwarzania' : 'Object to processing'}</li>
              <li>{isPl ? 'Cofniecia zgody na przetwarzanie (np. newsletter)' : 'Withdrawal of consent (e.g., newsletter)'}</li>
            </ul>
            <p>{isPl
              ? 'W celu realizacji powyzszych praw prosimy o kontakt: kontakt@vipile.pl'
              : 'To exercise the above rights, please contact: kontakt@vipile.pl'}</p>
          </div>
        </section>

        {/* 8 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-500" />
            {isPl ? '8. Kontakt' : '8. Contact'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'W sprawach dotyczacych ochrony danych osobowych mozna sie kontaktowac:'
              : 'For data protection matters, contact:'}</p>
            <ul className="list-none space-y-1 ml-2">
              <li>📧 kontakt@vipile.pl</li>
            </ul>
            <p>{isPl
              ? 'Uzytkownik ma rowniez prawo wniesienia skargi do Prezesa Urzedu Ochrony Danych Osobowych (PUODO).'
              : 'Users also have the right to file a complaint with the relevant data protection authority.'}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
