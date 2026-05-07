"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { authApi } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const publicPaths = ["/", "/login", "/register", "/verify-email", "/forgot-password"];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    async function loadUser() {
      try {
        const { user } = await authApi.me();
        // Since we rely on HTTP-only cookies, we might not have the raw token here.
        // That's fine, we just need the user object to signify they're logged in.
        setAuth(user, "cookie-based-token");
        if (isPublicPath && pathname !== "/" && pathname !== "/verify-email") {
          router.push("/dashboard");
        }
      } catch (error) {
        logout();
        if (!isPublicPath) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [pathname, router, setAuth, logout, isPublicPath]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
