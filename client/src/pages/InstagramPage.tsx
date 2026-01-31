import PlatformTabs from '../components/PlatformTabs';
import DownloadForm from '../components/DownloadForm';
import { useTranslation } from '../i18n';

export default function InstagramPage() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {t.downloadVideoFrom} <span className="text-purple-500">Instagram</span>
        </h1>
        <p className="text-gray-400 text-lg">
          {t.igSubtitle}
        </p>
      </div>

      <PlatformTabs />

      <DownloadForm
        platform="instagram"
        placeholder="https://www.instagram.com/reel/..."
        accentColor="bg-purple-600 hover:bg-purple-700"
      />
    </div>
  );
}
