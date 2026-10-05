"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t, locale } = useLanguage();
  return (
    <footer dir={locale === "ar" ? "rtl" : "ltr"} className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Link href="/" className="font-bold text-gray-950 dark:text-white">مِهني</Link>
          <p className="mt-1 text-gray-500">{t("footer.tagline")}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-gray-600 dark:text-gray-300">
          <Link href="/discover" className="hover:text-primary">{t("navbar.discover")}</Link>
          <Link href="/opportunities" className="hover:text-primary">{t("navbar.opportunities")}</Link>
          <Link href="/login" className="hover:text-primary">{t("navbar.login")}</Link>
        </div>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Mihni</p>
      </div>
    </footer>
  );
}
