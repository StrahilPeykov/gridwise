import translations from './data/translations.json';

export const useTranslation = (lang: 'en' | 'nl' | 'tr' = 'en') => {
  const t = (key: string): string => {
    // Fallback to English if language pack is missing
    const dict = (translations as any)[lang] ?? (translations as any)['en'];

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
