"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HomePage() {
  const { t, locale } = useLanguage();
  const steps = [1, 2, 3];
  const categories = [1, 2, 3, 4];
  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "text-right" : "text-left"}>
      <section className="border-b border-gray-200 bg-white px-4 py-20 dark:border-gray-800 dark:bg-gray-950 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold text-primary">{t("home.brandLine")}</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-gray-950 dark:text-white sm:text-6xl">
            {t("home.titleLead")} <span className="text-primary">{t("home.titleHighlight")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            {t("home.description")}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/opportunities" className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white hover:bg-primary/90">{t("home.searchWork")}</Link>
            <Link href="/discover" className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-800 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-100">{t("home.findProfessional")}</Link>
          </div>
          <p className="mt-5 text-sm text-gray-500">{t("home.tagline")}</p>
        </div>
      </section>

      <section id="how-it-works" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-primary">{t("home.howLabel")}</p>
          <h2 className="mt-2 text-3xl font-bold">{t("home.howTitle")}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <article key={step} className="border-t-2 border-primary pt-5">
                <span className="text-sm font-bold text-primary">{new Intl.NumberFormat(locale).format(step)}</span>
                <h3 className="mt-2 text-lg font-bold">{t(`home.step${step}Title`)}</h3>
                <p className="mt-2 leading-7 text-gray-600 dark:text-gray-300">{t(`home.step${step}Description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/50 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold text-primary">{t("home.categoriesLabel")}</p>
          <h2 className="mt-2 text-3xl font-bold">{t("home.categoriesTitle")}</h2>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => <li key={category} className="rounded-lg border border-gray-200 bg-white p-5 font-semibold dark:border-gray-800 dark:bg-gray-950">{t(`home.category${category}`)}</li>)}
          </ul>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">{t("home.trustLabel")}</p>
            <h2 className="mt-2 text-3xl font-bold">{t("home.trustTitle")}</h2>
          </div>
          <p className="leading-8 text-gray-600 dark:text-gray-300">{t("home.trustDescription")}</p>
        </div>
      </section>

      <section className="bg-gray-950 px-4 py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">{t("home.ctaTitle")}</h2>
            <p className="mt-2 text-gray-300">{t("home.ctaDescription")}</p>
          </div>
          <Link href="/signup" className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-gray-950 hover:bg-gray-100">{t("home.ctaButton")}</Link>
        </div>
      </section>
    </div>
  );
}
