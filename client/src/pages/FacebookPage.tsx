import PlatformTabs from '../components/PlatformTabs';
import DownloadForm from '../components/DownloadForm';
import { useTranslation } from '../i18n';

export default function FacebookPage() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">
          {t.downloadVideoFrom} <span className="text-blue-500">Facebook</span>
        </h1>
        <p className="text-gray-400 text-lg">
          {t.fbSubtitle}
        </p>
      </div>

      <PlatformTabs />

      <DownloadForm
        platform="facebook"
        placeholder="https://www.facebook.com/watch?v=..."
        accentColor="bg-blue-600 hover:bg-blue-700"
      />
    </div>
  );
}
