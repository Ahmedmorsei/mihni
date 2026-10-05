import Link from "next/link";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <section dir="rtl" className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-primary">مِهني</p>
      <h1 className="mt-3 text-3xl font-bold">{title}</h1>
      <p className="mt-3 max-w-xl leading-7 text-gray-600 dark:text-gray-300">{description}</p>
      <Link href="/" className="mt-7 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary dark:border-gray-700">العودة للرئيسية</Link>
    </section>
  );
}
