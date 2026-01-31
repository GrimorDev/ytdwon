import PlatformTabs from '../components/PlatformTabs';
import DownloadForm from '../components/DownloadForm';
import { useTranslation } from '../i18n';

export default function TwitterPage() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {t.downloadVideoFrom} <span className="text-sky-400">Twitter / X</span>
        </h1>
        <p className="text-gray-400 text-lg">
          {t.twSubtitle}
        </p>
      </div>

      <PlatformTabs />

      <DownloadForm
        platform="twitter"
        placeholder="https://x.com/user/status/..."
        accentColor="bg-sky-500 hover:bg-sky-600"
      />
    </div>
  );
}
