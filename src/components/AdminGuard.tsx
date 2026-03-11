"use client";

import { useAdminAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (pathname === "/login") {
      if (user && token && user.isAdmin) {
        router.push("/");
      }
      return;
    }

    if (!user || !token || !user.isAdmin) {
      router.push("/login");
    }
  }, [user, token, pathname, router, mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  return <>{children}</>;
}
