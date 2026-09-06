"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Only allow redirecting back to a same-origin, relative path. This stops
// the redirectTo query param (which is attacker-controllable) from being
// used to bounce a user off to an external site after login.
function sanitizeRedirectTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectTo(searchParams.get("redirectTo"));

  useEffect(() => {
    const finishLogin = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );
      if (error) {
        setError(error.message);
        return;
      }
      window.location.href = redirectTo;
    };
    finishLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center px-4 py-16 min-h-[80vh]">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 p-8 text-center">
        {error ? (
          <p
            role="alert"
            className="text-red-500 text-sm bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        ) : (
          <p role="status" className="text-sm text-gray-500">
            Signing you in...
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPageWithSuspense() {
  // useSearchParams() needs a Suspense boundary in the app router, since
  // it opts the tree below it out of static rendering.
  return (
    <Suspense fallback={null}>
      <AuthCallbackPage />
    </Suspense>
  );
}
