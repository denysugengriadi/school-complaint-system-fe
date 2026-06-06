'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">
                Sistem Pengaduan Sekolah
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
              <button
                onClick={async () => {
                  logout();
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 py-2 flex space-x-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              Dashboard
            </Link>
            {!isAdmin && (
              <>
                <Link
                  href="/dashboard/create-report"
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  Buat Laporan
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  Riwayat Laporan
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                href="/dashboard/admin/reports"
                className="text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                Kelola Laporan
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
