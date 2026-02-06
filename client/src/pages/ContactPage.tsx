import { useState } from 'react';
import { useTranslation } from '../i18n';
import { Mail, MessageCircle, HelpCircle, ChevronDown, ChevronUp, Shield, Clock, CreditCard, Flag, Users, Package } from 'lucide-react';

const faqItems = {
  pl: [
    {
      icon: Package,
      q: 'Jak dodac ogloszenie?',
      a: 'Kliknij przycisk "+ Dodaj ogloszenie" w gornym menu, wypelnij formularz (tytul, opis, zdjecia, cena, kategoria) i kliknij "Opublikuj". Twoje ogloszenie pojawi sie natychmiast.',
    },
    {
      icon: CreditCard,
      q: 'Ile kosztuje dodanie ogloszenia?',
      a: 'Dodawanie ogloszen jest calkowicie darmowe. Oferujemy platne uslugi promowania ogloszen, ktore zwiekszaja ich widocznosc na stronie glownej i na gorze list w kategoriach.',
    },
    {
      icon: Shield,
      q: 'Jak bezpiecznie kupowac na Vipile?',
      a: 'Zawsze sprawdzaj towar przed zakupem, umawiaj sie na odbiór osobisty w miejscach publicznych, nie przesylaj przedplat na konto. Sprawdzaj profil i opinie sprzedawcy.',
    },
    {
      icon: Flag,
      q: 'Jak zglosic podejrzane ogloszenie?',
      a: 'Na stronie kazdego ogloszenia znajdziesz przycisk "Zglos". Wybierz powod zgloszenia, opisz problem, a nasz zespol zweryfikuje ogloszenie.',
    },
    {
      icon: Users,
      q: 'Jak skontaktowac sie ze sprzedawca?',
      a: 'Na stronie ogloszenia znajdziesz formularz wiadomosci. Mozesz tez kliknac "Pokaz numer", jesli sprzedawca udostepnil telefon.',
    },
    {
      icon: Clock,
      q: 'Jak dlugo trwa promowanie ogloszenia?',
      a: 'Promowanie ogloszenia jest dostepne w pakietach 7, 14 i 30 dni. Po uplywie czasu ogloszenie wraca do zwyklego wyswietlania.',
    },
  ],
  en: [
    {
      icon: Package,
      q: 'How do I add a listing?',
      a: 'Click the "+ Add listing" button in the top menu, fill out the form (title, description, photos, price, category) and click "Publish". Your listing will appear immediately.',
    },
    {
      icon: CreditCard,
      q: 'How much does it cost to add a listing?',
      a: 'Adding listings is completely free. We offer paid promotion services that increase visibility on the homepage and at the top of category lists.',
    },
    {
      icon: Shield,
      q: 'How to buy safely on Vipile?',
      a: 'Always check the item before buying, arrange for personal pickup in public places, do not send prepayments. Check the seller\'s profile and reviews.',
    },
    {
      icon: Flag,
      q: 'How to report a suspicious listing?',
      a: 'On each listing page, you\'ll find a "Report" button. Select the reason, describe the issue, and our team will verify the listing.',
    },
    {
      icon: Users,
      q: 'How to contact the seller?',
      a: 'On the listing page, you\'ll find a message form. You can also click "Show phone number" if the seller provided one.',
    },
    {
      icon: Clock,
      q: 'How long does promotion last?',
      a: 'Listing promotion is available in 7, 14, and 30-day packages. After the period ends, the listing returns to normal display.',
    },
  ],
};

export default function ContactPage() {
  const { lang } = useTranslation();
  const isPl = lang === 'pl';
  const [expanded, setExpanded] = useState<number | null>(null);
  const items = isPl ? faqItems.pl : faqItems.en;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* FAQ Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPl ? 'Czesto zadawane pytania' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-gray-500">
            {isPl ? 'Znajdz odpowiedzi na najczesciej zadawane pytania' : 'Find answers to the most common questions'}
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="card !p-0 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary-500" />
                </div>
                <span className="flex-1 font-semibold text-sm">{item.q}</span>
                {expanded === idx
                  ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                }
              </button>
              {expanded === idx && (
                <div className="px-5 pb-5 pl-[4.5rem] text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
          <Mail className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isPl ? 'Kontakt' : 'Contact'}
        </h2>
        <p className="text-gray-500 mb-6">
          {isPl
            ? 'Nie znalazles odpowiedzi? Napisz do nas!'
            : 'Didn\'t find your answer? Contact us!'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
          <a
            href="mailto:kontakt@vipile.pl"
            className="card-hover !p-6 flex flex-col items-center gap-3 text-center group"
          >
            <Mail className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-semibold text-sm">{isPl ? 'Email' : 'Email'}</p>
              <p className="text-xs text-gray-500">kontakt@vipile.pl</p>
            </div>
          </a>
          <a
            href="#"
            className="card-hover !p-6 flex flex-col items-center gap-3 text-center group"
          >
            <MessageCircle className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
            <div>
              <p className="font-semibold text-sm">{isPl ? 'Formularz' : 'Form'}</p>
              <p className="text-xs text-gray-500">{isPl ? 'Wkrotce dostepny' : 'Coming soon'}</p>
            </div>
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          {isPl
            ? 'Odpowiadamy na wiadomosci w ciagu 24-48 godzin roboczych.'
            : 'We respond to messages within 24-48 business hours.'}
        </p>
      </div>
    </div>
  );
}
