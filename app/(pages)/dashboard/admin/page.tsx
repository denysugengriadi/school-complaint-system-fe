/* eslint-disable react-hooks/immutability */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { reportAPI, type Report } from '@/lib/api/report';
import { toast } from 'sonner';

interface AdminStats {
  total: number;
  pending: number;
  diproses: number;
  selesai: number;
  today: number;
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

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    pending: 0,
    diproses: 0,
    selesai: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchDashboardData();
  }, [user, isLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await reportAPI.getReports(1, 10);
      const allReports = response.data.data;

      const today = new Date().toDateString();
      const todayReports = allReports.filter(
        (r) => new Date(r.createdAt).toDateString() === today
      );

      const newStats: AdminStats = {
        total: response.data.pagination.total,
        pending: allReports.filter((r) => r.status === 'PENDING').length,
        diproses: allReports.filter((r) => r.status === 'IN_PROGRESS').length,
        selesai: allReports.filter((r) => r.status === 'COMPLETED').length,
        today: todayReports.length,
      };

      setStats(newStats);
      setRecentReports(allReports.slice(0, 5));
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
        <StatCard
          label="Hari Ini"
          value={stats.today}
          color="border-purple-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Laporan Terbaru
          </h2>
          <a
            href="/dashboard/admin/reports"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Lihat Semua →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {report.user?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 text-sm">
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
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
