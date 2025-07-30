type Translations = Record<string, string | Record<string, string>>;

export class I18n {
  private translations: Record<string, Translations> = {};
  private locale: string = 'en';

  public load(locale: string, translations: Translations): void {
    this.translations[locale] = translations;
  }

  public setLocale(locale: string): void {
    this.locale = locale;
  }

  public translate(key: string, options?: Record<string, string>): string {
    const translation = this.getTranslation(key, this.locale) || this.getTranslation(key, 'en');

    if (!translation) {
      return key;
    }

    if (typeof translation === 'string') {
      return this.replacePlaceholders(translation, options);
    }

    return key;
  }

  private getTranslation(key: string, locale: string): string | undefined {
    const keys = key.split('.');
    let current: string | Translations | undefined = this.translations[locale];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k] as string | Translations;
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  private replacePlaceholders(text: string, options?: Record<string, string>): string {
    if (!options) {
      return text;
    }

    return Object.entries(options).reduce((acc, [key, value]) => {
      return acc.replace(`{{${key}}}`, value);
    }, text);
  }
}
