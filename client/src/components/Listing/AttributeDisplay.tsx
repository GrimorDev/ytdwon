import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../i18n';
import {
  getAttributesForCategory,
  resolveSelectLabel,
  formatAttributeValue,
  type AttributeDefinition,
} from '../../config/categoryAttributes';

interface AttributeDisplayProps {
  categorySlug: string;
  attributes?: Record<string, any>;
  defaultExpanded?: boolean;
}

export default function AttributeDisplay({
  categorySlug,
  attributes,
  defaultExpanded = false,
}: AttributeDisplayProps) {
  const { lang } = useTranslation();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const attrDefinitions = getAttributesForCategory(categorySlug);

  if (!attributes || Object.keys(attributes).length === 0 || attrDefinitions.length === 0) {
    return null;
  }

  const getLabel = (attr: AttributeDefinition) =>
    lang === 'pl' ? attr.labelPl : attr.labelEn;

  const formatValue = (attr: AttributeDefinition, value: any): string => {
    if (value === undefined || value === null || value === '') return '-';

    if (attr.type === 'select' && attr.options) {
      return resolveSelectLabel(attr.options, value, lang);
    }

    return formatAttributeValue(value, attr.unit);
  };

  // Get attributes that have values
  const filledAttributes = attrDefinitions.filter(
    (attr) => attributes[attr.key] !== undefined && attributes[attr.key] !== ''
  );

  if (filledAttributes.length === 0) return null;

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {lang === 'pl' ? 'Parametry' : 'Specifications'}
        </h3>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {filledAttributes.map((attr) => (
            <div key={attr.key} className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getLabel(attr)}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatValue(attr, attributes[attr.key])}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
