"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGUAGES, switchLanguagePath } from "@/app/utils/language";

export default function VaultLanguageSelector({ lang }: { lang: string }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 text-[11px] font-black uppercase text-[#704f49]">
      <span className="material-symbols-outlined text-[16px]">language</span>
      {LANGUAGES.map((language) => (
        <Link
          key={language}
          href={switchLanguagePath(pathname, language)}
          className={`rounded-full px-2.5 py-1 transition ${
            language === lang
              ? "bg-[#cf160f] text-white"
              : "bg-[#fff0ed] text-[#704f49] ring-1 ring-[#f3dfdb] hover:bg-[#ffe2dc]"
          }`}
        >
          {language === "ja" ? "JP" : "EN"}
        </Link>
      ))}
    </div>
  );
}
