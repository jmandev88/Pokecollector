import { Language, normalizeLanguage } from "@/app/utils/language";

export function getLangFromParam(lang: string): Language {
  return normalizeLanguage(lang);
}