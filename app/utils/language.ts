export const LANGUAGES = ["en", "ja"] as const;
export type Language = (typeof LANGUAGES)[number];

/**
 * Validate language
 */
export function isValidLanguage(lang: string): lang is Language {
  return LANGUAGES.includes(lang as Language);
}

/**
 * Ensure safe fallback
 */
export function normalizeLanguage(lang?: string): Language {
  return lang && isValidLanguage(lang) ? lang : "en";
}

/**
 * Swap language in URL
 */
export function switchLanguagePath(
  pathname: string,
  targetLang: Language
): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${targetLang}`;
  }

  segments[0] = targetLang;

  return "/" + segments.join("/");
}