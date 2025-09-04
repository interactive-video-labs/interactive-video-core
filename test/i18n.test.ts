import { describe, it, expect } from 'vitest';
import { I18n } from '../src/i18n';

describe('I18n', () => {
  it('should translate a key for the current locale', () => {
    const i18n = new I18n();
    i18n.load('en', { hello: 'Hello' });
    i18n.setLocale('en');
    expect(i18n.translate('hello')).toBe('Hello');
  });

  it('should fall back to the default locale if a key is not found', () => {
    const i18n = new I18n();
    i18n.load('en', { hello: 'Hello' });
    i18n.setLocale('es');
    expect(i18n.translate('hello')).toBe('Hello');
  });

  it('should return the key if no translation is found', () => {
    const i18n = new I18n();
    i18n.setLocale('en');
    expect(i18n.translate('not.found')).toBe('not.found');
  });

  it('should handle nested keys', () => {
    const i18n = new I18n();
    i18n.load('en', { greetings: { hello: 'Hello' } });
    i18n.setLocale('en');
    expect(i18n.translate('greetings.hello')).toBe('Hello');
  });

  it('should replace placeholders in the translation', () => {
    const i18n = new I18n();
    i18n.load('en', { welcome: 'Welcome, {{name}}!' });
    i18n.setLocale('en');
    expect(i18n.translate('welcome', { name: 'John' })).toBe('Welcome, John!');
  });
});
