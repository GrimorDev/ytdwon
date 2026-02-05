import { useTranslation } from '../../i18n';
import { getAttributesForCategory, type AttributeDefinition } from '../../config/categoryAttributes';

interface AttributeFormProps {
  categorySlug: string;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

export default function AttributeForm({ categorySlug, values, onChange }: AttributeFormProps) {
  const { lang } = useTranslation();
  const attributes = getAttributesForCategory(categorySlug);

  if (attributes.length === 0) return null;

  const handleChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const getLabel = (attr: AttributeDefinition) =>
    lang === 'pl' ? attr.labelPl : attr.labelEn;

  const getOptionLabel = (option: { labelPl: string; labelEn: string }) =>
    lang === 'pl' ? option.labelPl : option.labelEn;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {lang === 'pl' ? 'Parametry produktu' : 'Product parameters'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attributes.map((attr) => (
          <div key={attr.key}>
            <label className="block text-sm font-medium mb-1">
              {getLabel(attr)}
              {attr.required && ' *'}
              {attr.unit && <span className="text-gray-500 ml-1">({attr.unit})</span>}
            </label>

            {attr.type === 'select' && attr.options ? (
              <select
                value={values[attr.key] || ''}
                onChange={(e) => handleChange(attr.key, e.target.value)}
                className="input-field"
                required={attr.required}
              >
                <option value="">{lang === 'pl' ? 'Wybierz...' : 'Select...'}</option>
                {attr.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {getOptionLabel(opt)}
                  </option>
                ))}
              </select>
            ) : attr.type === 'number' ? (
              <input
                type="number"
                value={values[attr.key] || ''}
                onChange={(e) => handleChange(attr.key, e.target.value ? Number(e.target.value) : '')}
                className="input-field"
                required={attr.required}
                min={attr.min}
                max={attr.max}
                placeholder={attr.unit || ''}
              />
            ) : (
              <input
                type="text"
                value={values[attr.key] || ''}
                onChange={(e) => handleChange(attr.key, e.target.value)}
                className="input-field"
                required={attr.required}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
