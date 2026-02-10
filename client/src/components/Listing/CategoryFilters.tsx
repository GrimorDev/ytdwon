import { useTranslation } from '../../i18n';
import { getFilterableAttributes, type AttributeDefinition } from '../../config/categoryAttributes';

interface CategoryFiltersProps {
  categorySlug: string;
  parentSlug?: string;
  grandParentSlug?: string;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export default function CategoryFilters({ categorySlug, parentSlug, grandParentSlug, values, onChange }: CategoryFiltersProps) {
  const { lang } = useTranslation();

  // Try exact slug first, then parent slug, then grandparent slug as fallback
  let filterableAttrs = getFilterableAttributes(categorySlug);
  if (filterableAttrs.length === 0 && parentSlug) {
    filterableAttrs = getFilterableAttributes(parentSlug);
  }
  if (filterableAttrs.length === 0 && grandParentSlug) {
    filterableAttrs = getFilterableAttributes(grandParentSlug);
  }

  if (filterableAttrs.length === 0) return null;

  const getLabel = (attr: AttributeDefinition) =>
    lang === 'pl' ? attr.labelPl : attr.labelEn;

  const getOptionLabel = (option: { labelPl: string; labelEn: string }) =>
    lang === 'pl' ? option.labelPl : option.labelEn;

  const handleChange = (key: string, value: string) => {
    const newValues = { ...values };
    if (value === '') {
      delete newValues[key];
    } else {
      newValues[key] = value;
    }
    onChange(newValues);
  };

  const handleRangeChange = (key: string, type: 'Min' | 'Max', value: string) => {
    handleChange(`${key}${type}`, value);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
        {lang === 'pl' ? 'Filtry kategorii' : 'Category filters'}
      </h3>
      <div className="space-y-3">
        {filterableAttrs.map((attr) => (
          <div key={attr.key}>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {getLabel(attr)}
              {attr.unit && <span className="text-gray-500 ml-1">({attr.unit})</span>}
            </label>

            {attr.type === 'select' && attr.options ? (
              <select
                value={values[attr.key] || ''}
                onChange={(e) => handleChange(attr.key, e.target.value)}
                className="input-field text-sm !py-2"
              >
                <option value="">{lang === 'pl' ? 'Wszystkie' : 'All'}</option>
                {attr.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {getOptionLabel(opt)}
                  </option>
                ))}
              </select>
            ) : attr.type === 'number' ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={values[`${attr.key}Min`] || ''}
                  onChange={(e) => handleRangeChange(attr.key, 'Min', e.target.value)}
                  className="input-field text-sm !py-2 w-1/2"
                  placeholder={lang === 'pl' ? 'Od' : 'From'}
                  min={attr.min}
                  max={attr.max}
                />
                <input
                  type="number"
                  value={values[`${attr.key}Max`] || ''}
                  onChange={(e) => handleRangeChange(attr.key, 'Max', e.target.value)}
                  className="input-field text-sm !py-2 w-1/2"
                  placeholder={lang === 'pl' ? 'Do' : 'To'}
                  min={attr.min}
                  max={attr.max}
                />
              </div>
            ) : (
              <input
                type="text"
                value={values[attr.key] || ''}
                onChange={(e) => handleChange(attr.key, e.target.value)}
                className="input-field text-sm !py-2"
                placeholder={lang === 'pl' ? 'Wpisz...' : 'Enter...'}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
