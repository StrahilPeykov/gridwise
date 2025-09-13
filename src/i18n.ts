import translations from './data/translations.json';

export const useTranslation = (lang: 'en' | 'nl' = 'en') => {
  const t = (key: string): string => {
    const dict = translations[lang] as Record<string, any>;

    // 1) Direct lookup for flat keys like "landing.title"
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      const v = dict[key];
      return v === undefined ? key : String(v);
    }

    // 2) Nested lookup for objects like { landing: { title: "..." } }
    const parts = key.split('.');
    let value: any = dict;
    for (const p of parts) {
      value = value?.[p];
      if (value === undefined) break;
    }

    return value === undefined ? key : String(value);
  };

  return { t };
};