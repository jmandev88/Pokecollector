"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { NAV_ITEMS } from "@/app/config/Navigation";
import { switchLanguagePath } from "@/app/utils/language";

const LANGUAGES = ["en", "ja"] as const;

export default function Header({ lang }: { lang: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-700/80 bg-[#071121]/95 px-4 py-4 text-slate-100 md:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href={`/${lang}`} className="text-3xl font-black tracking-tight">
            MCC
          </Link>

          <nav>
            <ul className="flex items-center gap-7">
              {NAV_ITEMS.map((item) => {
                const href = `/${lang}${item.href}`;
                const isActive =
                  pathname === href ||
                  (item.href !== "/" && pathname.startsWith(href));

                return (
                  <li key={item.href}>
                    <Link
                      href={href}
                      className={`pb-1 text-sm font-medium transition ${
                        isActive
                          ? "border-b-2 border-indigo-200 text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="material-symbols-outlined text-[18px] text-slate-300">
            language
          </span>

          {LANGUAGES.map((language) => (
            <Link
              key={language}
              href={switchLanguagePath(pathname, language)}
              className={`font-semibold ${
                language === lang ? "text-white" : "text-slate-500"
              }`}
            >
              {language.toUpperCase()}
            </Link>
          ))}

          {session ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-slate-100 md:inline">
                Hi, {session.user?.name}
              </span>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border border-slate-600"
                />
              )}
            </div>
          ) : (
            <button
              className="rounded-md border border-slate-600 px-3 py-1 text-xs font-semibold uppercase text-slate-200 hover:border-indigo-200"
              onClick={() => signIn("google")}
            >
              Sign in
            </button>
          )}

          <span className="material-symbols-outlined text-[20px] text-slate-400">
            settings
          </span>
        </div>
      </div>
    </header>
  );
}
