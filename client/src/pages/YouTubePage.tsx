import PlatformTabs from '../components/PlatformTabs';
import DownloadForm from '../components/DownloadForm';
import { useTranslation } from '../i18n';
import {
  Music, Film, ListOrdered, Smartphone, Zap, Globe,
  Download, Shield,
} from 'lucide-react';

export default function YouTubePage() {
  const { t } = useTranslation();

  const features = [
    { icon: Film, title: t.featureVideoTitle, desc: t.featureVideoDesc, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: Music, title: t.featureAudioTitle, desc: t.featureAudioDesc, color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: Smartphone, title: t.featureShortsTitle, desc: t.featureShortsDesc, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ListOrdered, title: t.featurePlaylistTitle, desc: t.featurePlaylistDesc, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: Globe, title: t.featurePlatformsTitle, desc: t.featurePlatformsDesc, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: Zap, title: t.featureSpeedTitle, desc: t.featureSpeedDesc, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {t.downloadVideoFrom} <span className="text-red-500">YouTube</span>
        </h1>
        <p className="text-gray-400 text-lg">{t.ytSubtitle}</p>
      </div>

      <PlatformTabs />

      <DownloadForm
        platform="youtube"
        placeholder="https://www.youtube.com/watch?v=..."
        accentColor="bg-red-600 hover:bg-red-700"
      />

      <div className="mt-16 mb-8">
        <h2 className="text-2xl font-bold text-center mb-2">{t.featuresTitle}</h2>
        <p className="text-gray-500 text-center mb-8">{t.featuresSubtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card !p-5 hover:border-gray-600 transition-colors">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 card">
        <h2 className="text-xl font-bold text-center mb-6">{t.howItWorks}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: t.step1Title, desc: t.step1Desc },
            { step: '2', title: t.step2Title, desc: t.step2Desc },
            { step: '3', title: t.step3Title, desc: t.step3Desc },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                {step}
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
