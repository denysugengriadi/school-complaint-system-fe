/* eslint-disable react-hooks/immutability */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { reportAPI, type Report } from '@/lib/api/report';
import { toast } from 'sonner';

interface DashboardStats {
  total: number;
  pending: number;
  diproses: number;
  selesai: number;
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    diproses: 0,
    selesai: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData();
  }, [user, isLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await reportAPI.getReports(1, 5);
      const reports = response.data.data;

      const newStats: DashboardStats = {
        total: response.data.pagination.total,
        pending: reports.filter((r) => r.status === 'PENDING').length,
        diproses: reports.filter((r) => r.status === 'IN_PROGRESS').length,
        selesai: reports.filter((r) => r.status === 'COMPLETED').length,
      };

      setStats(newStats);
      setRecentReports(reports);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Gagal mengambil data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Laporan"
          value={stats.total}
          color="border-blue-500"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="border-yellow-500"
        />
        <StatCard
          label="Diproses"
          value={stats.diproses}
          color="border-orange-500"
        />
        <StatCard
          label="Selesai"
          value={stats.selesai}
          color="border-green-500"
        />
      </div>

      {/* Recent Reports */}
      {!isAdmin && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Laporan Terbaru
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {report.description.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(report.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'IN_PROGRESS'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">Belum ada laporan</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
