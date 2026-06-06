/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { reportAPI, type Report, ASSET_BASE_URL } from '@/lib/api/report';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const limit = 10;

  async function fetchReports() {
    try {
      setLoading(true);
      const response = await reportAPI.getReports(page, limit, {
        search,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setReports(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalReports(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Gagal mengambil data laporan');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, startDate, endDate]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchText.trim());
  };

  const translateReportType = (type: string) => {
    if (type === 'COMPLAINT') return 'Pengaduan';
    if (type === 'SUGGESTION') return 'Saran';
    return type;
  };

  const translateStatus = (status: string) => {
    if (status === 'PENDING') return 'Menunggu';
    if (status === 'IN_PROGRESS') return 'Sedang Diproses';
    if (status === 'COMPLETED') return 'Selesai';
    return status;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string }
    > = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      IN_PROGRESS: { bg: 'bg-orange-100', text: 'text-orange-800' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
    };
    const style = statusMap[status] || statusMap.PENDING;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {translateStatus(status)}
      </span>
    );
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Riwayat Laporan</h1>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex flex-col sm:flex-row gap-3">
            <label htmlFor="report-search" className="sr-only">
              Cari laporan
            </label>
            <input
              id="report-search"
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Cari judul atau deskripsi laporan..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Cari
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              setPage(1);
              setSearchText('');
              setSearch('');
              setStatusFilter('ALL');
              setStartDate('');
              setEndDate('');
            }}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Reset filter
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED');
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="IN_PROGRESS">Sedang Diproses</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dari tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(1);
                setStartDate(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hingga tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(1);
                setEndDate(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Gambar
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length > 0 ? (
                reports.map((report, idx) => (
                  <tr key={report.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors`}>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 max-w-xs truncate">
                      {report.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {translateReportType(report.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {report.image ? (
                        <img
                          src={`${ASSET_BASE_URL}/${report.image}`}
                          alt={report.title}
                          className="h-12 w-12 object-cover rounded-md border border-gray-300 mx-auto"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/48?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 mx-auto">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="inline-flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-medium rounded transition"
                      >
                        👁️ Lihat
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg">Belum ada laporan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalReports > 0 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-gray-900 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-md font-medium transition"
                >
                  ← Sebelumnya
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`min-w-[38px] rounded-md px-3 py-2 text-sm font-medium transition ${
                      pageNumber === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-gray-900 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-md font-medium transition"
                >
                  Berikutnya →
                </button>
              </div>
              <span className="text-gray-600">Halaman {page} dari {totalPages}</span>
            </div>
            <div className="mt-3 text-right text-sm text-gray-500">
              Total laporan: {totalReports}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
