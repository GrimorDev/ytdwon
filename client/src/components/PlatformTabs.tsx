import { useLocation, Link } from 'react-router-dom';

const platforms = [
  { path: '/', label: 'YouTube', color: 'text-red-500 border-red-500' },
  { path: '/facebook', label: 'Facebook', color: 'text-blue-500 border-blue-500' },
  { path: '/twitter', label: 'Twitter / X', color: 'text-sky-400 border-sky-400' },
  { path: '/tiktok', label: 'TikTok', color: 'text-pink-500 border-pink-500' },
  { path: '/instagram', label: 'Instagram', color: 'text-purple-500 border-purple-500' },
];

export default function PlatformTabs() {
  const location = useLocation();

  return (
    <div className="flex justify-center mb-8">
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1.5">
        {platforms.map((p) => {
          const isActive = location.pathname === p.path;
          return (
            <Link
              key={p.path}
              to={p.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `bg-gray-800 ${p.color.split(' ')[0]}`
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
