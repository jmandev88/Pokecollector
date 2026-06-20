"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NAV_ITEMS } from "@/app/config/Navigation";
import { switchLanguagePath } from "@/app/utils/language";
import { signIn, useSession } from "next-auth/react";

const LANGUAGES = ["en", "ja"] as const;

export default function Header({ lang }: { lang: string }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <header className="bg-gray-800 shadow border-b border-b-white px-4 py-2">
      <div className="flex items-center justify-between relative">

        <Link href={`/${lang}`} className="flex items-center gap-4">
          <Image
            src="/logo-mobile-dark.svg"
            alt="Logo"
            width={72}
            height={32}
          />
        </Link>

        <nav>
          <ul className="flex space-x-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${lang}${item.href}`}
                  className="text-sm text-white underline underline-offset-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div></div>

        <div className="absolute right-0 top-0 flex items-center gap-2 text-sm text-white">
{session ? (
    <div className="flex mr-8 pr-10 items-center relative">
      <div className="relative top-[2px]">Hi, {session.user?.name}</div>
      <div>

      <img src={session.user?.image ?? ""} alt="avatar" width={100} className="rounded-full h-6 w-6 border-1 border-white/25 absolute right-0 top-0" />
      </div>
      </div>
) : (
          <button onClick={() => signIn("google")}>
            Sign in with Google
            </button>
)}

          {LANGUAGES.map((l) => (
            <Link
              key={l}
              href={switchLanguagePath(pathname, l)}
              className={`px-2 py-1 border rounded ${
                l === lang ? "bg-white text-black" : "opacity-60"
              }`}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>

      </div>
    </header>
  );
}