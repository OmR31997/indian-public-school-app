import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Admin Sign In | Indian Public School",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-[#eef4fb]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a5d9c] border-t-transparent" /></div>}>
      <AdminLogin />
    </Suspense>
  );
}
