import Link from "next/link";
import { ReactNode } from "react";
import VaultLanguageSelector from "@/app/components/Vault/VaultLanguageSelector";

function SidebarLink({
  href,
  icon,
  active = false,
}: {
  href: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
        active
          ? "bg-[#74f47f] text-[#13762c]"
          : "text-[#704f49] hover:bg-[#ffe2dc]"
      }`}
    >
      <span className="material-symbols-outlined text-[19px]">{icon}</span>
    </Link>
  );
}

export default function VaultBrowseShell({
  lang,
  title,
  subtitle,
  children,
}: {
  lang: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#2c1715]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[60px] flex-col items-center border-r border-[#f2d9d4] bg-[#fff0ed] py-5 md:flex">
        <Link href={`/${lang}`} className="text-[#ce130c]">
          <span className="material-symbols-outlined text-[28px]">style</span>
        </Link>

        <nav className="mt-12 flex flex-1 flex-col items-center gap-5">
          <SidebarLink href={`/${lang}`} icon="dashboard" />
          <SidebarLink href={`/${lang}/sets`} icon="collections_bookmark" />
          <SidebarLink href={`/${lang}/browse`} icon="category" active />
          <SidebarLink href={`/${lang}/sealed`} icon="storefront" />
        </nav>

        <span className="material-symbols-outlined text-[21px] text-[#704f49]">
          settings
        </span>
      </aside>

      <div className="min-h-screen md:pl-[60px]">
        <header className="flex min-h-[96px] items-center justify-between border-b border-[#f4dfdb] bg-white/85 px-6 md:px-12">
          <div className="flex items-center gap-9">
            <h1 className="text-xl font-black tracking-tight text-[#c7130c] md:text-2xl">
              Browse Cards
            </h1>
            <div className="hidden h-6 w-px bg-[#eac9c2] md:block" />
            <div className="hidden text-[9px] font-black uppercase tracking-[0.12em] text-[#69443f] md:block">
              Pocket Monsters Vault v2.0
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden h-11 w-[320px] items-center gap-3 rounded-full border border-[#f0d4cf] bg-[#fff0ed] px-4 text-[#856c70] shadow-sm lg:flex">
              <span className="material-symbols-outlined text-[16px]">
                search
              </span>
              <span className="text-sm">Search filters...</span>
            </div>
            <VaultLanguageSelector lang={lang} />
            <span className="material-symbols-outlined text-[23px] text-[#6f4d47]">
              notifications
            </span>
          </div>
        </header>

        <main className="min-h-[calc(100vh-180px)] px-6 py-10 md:px-12">
          <section className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Link
                href={`/${lang}`}
                className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#cf160f]"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
                Dashboard
              </Link>
              <h2 className="text-2xl font-black tracking-tight">{title}</h2>
              <p className="mt-2 text-sm font-semibold text-[#6e514e]">
                {subtitle}
              </p>
            </div>
          </section>

          {children}
        </main>

        <footer className="flex min-h-[82px] items-center justify-between bg-[#ffe0da] px-6 text-[#72524d] md:px-12">
          <div className="text-[9px] font-black uppercase tracking-wide text-[#c7130c]">
            Pokekeep Vault
          </div>
          <div className="text-sm font-medium">
            © 2024 PokeKeep Vault. All card images property of The Pokémon Company.
          </div>
          <div className="flex gap-10 text-sm font-medium">
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
