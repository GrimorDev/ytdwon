import PlatformTabs from '../components/PlatformTabs';
import DownloadForm from '../components/DownloadForm';
import { useTranslation } from '../i18n';

export default function TikTokPage() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {t.downloadVideoFrom} <span className="text-pink-500">TikTok</span>
        </h1>
        <p className="text-gray-400 text-lg">
          {t.ttSubtitle}
        </p>
      </div>

      <PlatformTabs />

      <DownloadForm
        platform="tiktok"
        placeholder="https://www.tiktok.com/@user/video/..."
        accentColor="bg-pink-600 hover:bg-pink-700"
      />
    </div>
  );
}
