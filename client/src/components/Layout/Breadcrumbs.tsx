import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '../../i18n';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const { lang } = useTranslation();

  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: lang === 'pl' ? 'Strona główna' : 'Home', href: '/' }, ...items]
    : items;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index === 0 && showHome ? (
              <Link
                to={item.href || '/'}
                className="flex items-center gap-1 hover:text-indigo-500 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ) : isLast ? (
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="hover:text-indigo-500 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </span>
        );
      })}
    </nav>
  );
}
