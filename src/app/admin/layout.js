"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Don't protect the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [status, router, isLoginPage]);

  // If it's the login page, render without protection
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {session?.user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="text-white border-white hover:bg-gray-800"
              >
                Logout
              </Button>
              <Link href="/" className="text-sm hover:text-gray-300">
                ← Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-2">
                <Link
                  href="/admin"
                  className="block px-4 py-2 rounded hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className="block px-4 py-2 rounded hover:bg-gray-100"
                >
                  Products
                </Link>
                <Link
                  href="/admin/orders"
                  className="block px-4 py-2 rounded hover:bg-gray-100"
                >
                  Orders
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
