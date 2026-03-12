"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // If we are on the login page, don't show the sidebar and navbar shell
  if (pathname === "/login") {
    return <main className="w-full">{children}</main>;
  }

  return (
    <>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </>
  );
}
