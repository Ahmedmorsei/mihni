"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, locale } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const links = user
    ? [[t("navbar.home"), "/"], [t("navbar.discover"), "/discover"], [t("navbar.opportunities"), "/opportunities"], [t("navbar.myWork"), "/dashboard"], [t("navbar.profile"), "/profile"]]
    : [[t("navbar.home"), "/"], [t("navbar.discover"), "/discover"], [t("navbar.opportunities"), "/opportunities"], [t("navbar.how"), "/#how-it-works"]];

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header dir={locale === "ar" ? "rtl" : "ltr"} className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-gray-950/95">
      <nav aria-label={t("navbar.label")} className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight text-gray-950 dark:text-white">
          <span className="text-primary">مِهني</span><span className="ms-2 text-xs font-medium text-gray-500">mihni.work</span>
        </Link>
        <button type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)} className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:hidden">
          {menuOpen ? t("navbar.close") : t("navbar.menu")}
        </button>
        <div id="site-navigation" className={`${menuOpen ? "flex" : "hidden"} absolute inset-x-0 top-full flex-col gap-1 border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 sm:static sm:flex sm:flex-row sm:items-center sm:gap-5 sm:border-0 sm:bg-transparent sm:p-0 dark:sm:bg-transparent`}>
          {links.map(([label, href]) => <Link key={href} href={href} className="rounded px-2 py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200">{label}</Link>)}
          {user ? <button type="button" onClick={logout} className="rounded px-2 py-2 text-start text-sm font-medium text-gray-500 hover:text-primary">{t("navbar.logout")}</button> : <>
            <Link href="/login" className="rounded px-2 py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200">{t("navbar.login")}</Link>
            <Link href="/signup" className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:bg-primary/90">{t("navbar.start")}</Link>
          </>}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
