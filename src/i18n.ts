import { Translations } from './types';

/**
 * The I18n class handles internationalization for the player.
 * It allows loading translations for different locales and provides methods to translate keys.
 */
export class I18n {
  private translations: Record<string, Translations> = {};
  private locale: string = 'en';

  /**
   * Loads translations for a specific locale.
   * @param locale - The locale to load translations for.
   * @param translations - The translation data.
   */
  public load(locale: string, translations: Translations): void {
    this.translations[locale] = translations;
  }

  /**
   * Sets the current locale for localization.
   * @param locale - The new locale.
   */
  public setLocale(locale: string): void {
    this.locale = locale;
  }

  /**
   * Translates a key to the current locale.
   * @param key - The key to translate.
   * @param options - Optional placeholders to replace in the translation.
   * @returns The translated string or the original key if not found.
   */
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

  /**
   * Gets the translation for a key in a specific locale.
   * @param key - The key to translate.
   * @param locale - The locale to get the translation for.
   * @returns The translated string or undefined if not found.
   */
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

  /**
   * Replaces placeholders in a translation string.
   * @param text - The translation string with placeholders.
   * @param options - Optional placeholders to replace in the translation.
   * @returns The translated string with placeholders replaced.
   */
  private replacePlaceholders(text: string, options?: Record<string, string>): string {
    if (!options) {
      return text;
    }

    return Object.entries(options).reduce((acc, [key, value]) => {
      return acc.replace(`{{${key}}}`, value);
    }, text);
  }
}
