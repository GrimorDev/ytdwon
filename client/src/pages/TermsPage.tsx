import { useTranslation } from '../i18n';
import { Shield, AlertTriangle, Users, FileText, Scale, Ban, MessageCircle, CreditCard } from 'lucide-react';

export default function TermsPage() {
  const { lang } = useTranslation();
  const isPl = lang === 'pl';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isPl ? 'Regulamin serwisu Vipile' : 'Vipile Terms of Service'}
        </h1>
        <p className="text-sm text-gray-500">
          {isPl ? 'Ostatnia aktualizacja: 6 lutego 2026' : 'Last updated: February 6, 2026'}
        </p>
      </div>

      <div className="space-y-8">
        {/* 1 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            {isPl ? '1. Postanowienia ogolne' : '1. General provisions'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Serwis Vipile (dalej: "Serwis") jest platforma ogloszen internetowych umozliwiajaca uzytkownikom publikowanie i przegladanie ogloszen dotyczacych sprzedazy towarow i uslug.'
              : 'Vipile (hereinafter: "Service") is an online classifieds platform enabling users to publish and browse listings for goods and services.'}</p>
            <p>{isPl
              ? 'Korzystanie z Serwisu oznacza akceptacje niniejszego Regulaminu w calosci.'
              : 'Using the Service means accepting these Terms of Service in their entirety.'}</p>
            <p>{isPl
              ? 'Administratorem Serwisu jest Vipile. Kontakt: kontakt@vipile.pl'
              : 'The Service is administered by Vipile. Contact: kontakt@vipile.pl'}</p>
          </div>
        </section>

        {/* 2 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {isPl ? '2. Rola Serwisu - wazne zastrzezenie' : '2. Role of the Service - important disclaimer'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                {isPl
                  ? 'Vipile pelni wylacznie role posrednika technologicznego. Serwis NIE jest strona transakcji i nie ponosi odpowiedzialnosci za:'
                  : 'Vipile acts solely as a technological intermediary. The Service is NOT a party to transactions and bears no responsibility for:'}
              </p>
            </div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Tresc i prawdziwosc ogloszen zamieszczanych przez uzytkownikow' : 'Content and accuracy of user-posted listings'}</li>
              <li>{isPl ? 'Jakosc, bezpieczenstwo i legalnosc oferowanych towarow lub uslug' : 'Quality, safety, and legality of offered goods or services'}</li>
              <li>{isPl ? 'Zdolnosc sprzedawcow do sprzedazy i kupujacych do zaplaty' : 'Sellers\' ability to sell and buyers\' ability to pay'}</li>
              <li>{isPl ? 'Przebieg i realizacje transakcji miedzy uzytkownikami' : 'Course and completion of transactions between users'}</li>
              <li>{isPl ? 'Szkody wynikle z transakcji zawartych miedzy uzytkownikami' : 'Damages resulting from transactions between users'}</li>
              <li>{isPl ? 'Dane osobowe udostepniane przez uzytkownikow innym uzytkownikom' : 'Personal data shared by users with other users'}</li>
            </ul>
            <p>{isPl
              ? 'Uzytkownik dokonuje transakcji na wlasna odpowiedzialnosc i ryzyko. Zalecamy ostrożnosc, weryfikacje kontrahenta oraz osobisty odbior towaru.'
              : 'Users transact at their own risk and responsibility. We recommend caution, verifying counterparts, and personal item collection.'}</p>
          </div>
        </section>

        {/* 3 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            {isPl ? '3. Konto uzytkownika' : '3. User account'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Rejestracja wymaga podania prawdziwych danych: adresu e-mail, imienia i hasla. Uzytkownik odpowiada za poufnosc swoich danych logowania.'
              : 'Registration requires providing real data: email address, name, and password. Users are responsible for the confidentiality of their login credentials.'}</p>
            <p>{isPl
              ? 'Kazdy uzytkownik moze posiadac tylko jedno konto. Tworzenie wielu kont w celu obejscia ograniczen jest zabronione.'
              : 'Each user may only have one account. Creating multiple accounts to circumvent restrictions is prohibited.'}</p>
            <p>{isPl
              ? 'Administrator zastrzega sobie prawo do zawieszenia lub usunięcia konta uzytkownika, ktory narusza Regulamin.'
              : 'The administrator reserves the right to suspend or delete accounts of users who violate these Terms.'}</p>
          </div>
        </section>

        {/* 4 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-green-500" />
            {isPl ? '4. Zasady publikacji ogloszen' : '4. Listing publication rules'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl ? 'Uzytkownik zobowiazuje sie do:' : 'Users agree to:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Zamieszczania ogloszen zgodnych z prawem i stanem faktycznym' : 'Publishing listings that are legal and accurate'}</li>
              <li>{isPl ? 'Podawania prawidlowej ceny, opisu i zdjec przedmiotu' : 'Providing correct price, description, and photos of the item'}</li>
              <li>{isPl ? 'Niestosowania tresci obraźliwych, wulgarnych lub dyskryminujacych' : 'Not using offensive, vulgar, or discriminatory content'}</li>
              <li>{isPl ? 'Niepublikowania duplikatow tego samego ogloszenia' : 'Not publishing duplicates of the same listing'}</li>
              <li>{isPl ? 'Umieszczania ogloszen we wlasciwej kategorii' : 'Placing listings in the correct category'}</li>
            </ul>
            <p>{isPl
              ? 'Zabronione jest wystawianie towarow kradzionych, podrobionych, nielegalnych lub niebezpiecznych.'
              : 'It is forbidden to list stolen, counterfeit, illegal, or dangerous goods.'}</p>
          </div>
        </section>

        {/* 5 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            {isPl ? '5. Uslugi platne' : '5. Paid services'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Podstawowe korzystanie z Serwisu (przegladanie i publikacja ogloszen) jest bezplatne.'
              : 'Basic use of the Service (browsing and publishing listings) is free.'}</p>
            <p>{isPl
              ? 'Serwis oferuje platne uslugi dodatkowe, takie jak promowanie ogloszen. Opłaty za usługi płatne sa wskazane przed dokonaniem płatności.'
              : 'The Service offers paid additional services, such as listing promotion. Fees for paid services are indicated before payment.'}</p>
            <p>{isPl
              ? 'Platnosci sa przetwarzane przez zewnetrznego operatora platnosci (Stripe). Vipile nie przechowuje danych kart platniczych.'
              : 'Payments are processed by an external payment operator (Stripe). Vipile does not store payment card data.'}</p>
          </div>
        </section>

        {/* 6 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            {isPl ? '6. Naruszenia i sankcje' : '6. Violations and sanctions'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'W przypadku naruszenia Regulaminu Administrator moze:'
              : 'In case of Terms violation, the Administrator may:'}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{isPl ? 'Usunac ogloszenie naruszajace zasady' : 'Remove the listing violating the rules'}</li>
              <li>{isPl ? 'Tymczasowo zablokowac konto uzytkownika' : 'Temporarily suspend the user\'s account'}</li>
              <li>{isPl ? 'Trwale usunac konto w przypadku powtarzajacych sie naruszen' : 'Permanently delete the account in case of repeated violations'}</li>
            </ul>
            <p>{isPl
              ? 'Kazdy uzytkownik moze zglosic ogloszenie naruszajace Regulamin za pomoca przycisku "Zglos" na stronie ogloszenia.'
              : 'Any user can report a listing violating the Terms using the "Report" button on the listing page.'}</p>
          </div>
        </section>

        {/* 7 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-500" />
            {isPl ? '7. Komunikacja i wiadomosci' : '7. Communication and messages'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Serwis umozliwia wymiane wiadomosci miedzy uzytkownikami. Zabrania sie wykorzystywania systemu wiadomosci do spamu, reklam niezwiazanych z transakcja, przesylania tresci niezgodnych z prawem lub zasadami wspolzycia spolecznego.'
              : 'The Service enables message exchange between users. It is forbidden to use the messaging system for spam, unrelated advertising, or sending content that violates the law or social norms.'}</p>
            <p>{isPl
              ? 'Administrator zastrzega sobie prawo do monitorowania wiadomosci w celu wykrywania naruszen i zapewnienia bezpieczenstwa uzytkownikow.'
              : 'The Administrator reserves the right to monitor messages to detect violations and ensure user safety.'}</p>
          </div>
        </section>

        {/* 8 */}
        <section className="card !p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" />
            {isPl ? '8. Postanowienia koncowe' : '8. Final provisions'}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
            <p>{isPl
              ? 'Administrator zastrzega sobie prawo do zmiany Regulaminu. O kazdej zmianie uzytkownicy zostana powiadomieni drogą elektroniczna.'
              : 'The Administrator reserves the right to modify these Terms. Users will be notified of any changes electronically.'}</p>
            <p>{isPl
              ? 'W sprawach nieuregulowanych Regulaminem zastosowanie maja przepisy prawa polskiego.'
              : 'In matters not regulated by these Terms, Polish law shall apply.'}</p>
            <p>{isPl
              ? 'Wszelkie spory miedzy uzytkownikami a Serwisem beda rozstrzygane przez sad wlasciwy miejscowo dla siedziby Administratora.'
              : 'Any disputes between users and the Service shall be resolved by the court having jurisdiction over the Administrator\'s registered office.'}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
