import Link from "next/link";

export default function NotFound() {
  return (
    <div dir="rtl" className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-primary">٤٠٤</p>
      <h1 className="mt-2 text-3xl font-bold">الصفحة غير موجودة</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      <Link href="/" className="mt-6 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">العودة إلى الرئيسية</Link>
    </div>
  );
}
