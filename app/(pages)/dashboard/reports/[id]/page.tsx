/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { reportAPI, type Report, ASSET_BASE_URL } from '@/lib/api/report';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const reportId = parseInt(params.id as string);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [adminImage, setAdminImage] = useState<File | null>(null);
  const [adminImagePreview, setAdminImagePreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  async function fetchReport() {
    try {
      setLoading(true);
      const response = await reportAPI.getReportById(reportId);
      const reportData = response.data;
      setReport(reportData);
      setStatus(reportData.status);
      setAdminFeedback(reportData.adminFeedback ?? '');
      setAdminImagePreview(
        reportData.adminImage ? `${ASSET_BASE_URL}/${reportData.adminImage}` : null
      );
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('Gagal mengambil detail laporan');
      router.push('/dashboard/reports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  const handleAdminImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAdminImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAdminImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAdminImagePreview(report?.adminImage ? `${ASSET_BASE_URL}/${report.adminImage}` : null);
    }
  };

  const handleAdminSubmit = async () => {
    if (!report) return;
    try {
      setUpdating(true);
      const response = await reportAPI.updateReportStatus(reportId, {
        status,
        adminFeedback,
        adminImage: adminImage ?? undefined,
      });
      const updatedReport = response.data;
      setReport(updatedReport);
      setStatus(updatedReport.status);
      setAdminFeedback(updatedReport.adminFeedback ?? '');
      setAdminImagePreview(
        updatedReport.adminImage ? `${ASSET_BASE_URL}/${updatedReport.adminImage}` : null
      );
      toast.success('Feedback admin berhasil disimpan');
      setAdminImage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan feedback admin';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Laporan tidak ditemukan</p>
        <Link
          href="/dashboard/reports"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Kembali ke Riwayat Laporan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/reports"
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block"
      >
        ← Kembali ke Riwayat
      </Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
              <p className="text-sm text-gray-500 mt-1">oleh {report.user?.name} • {new Date(report.createdAt).toLocaleString('id-ID')}</p>
              <p className="text-sm text-gray-500 mt-1">Jenis laporan: <span className="font-medium text-gray-900">{translateReportType(report.type)}</span></p>
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-900">Deskripsi</h4>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{report.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-2">{getStatusBadge(report.status)}</div>
              {user?.role === 'ADMIN' && (
                <div className="inline-block text-right">
                  <button
                    onClick={() => setShowAdminPanel((s) => !s)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                      showAdminPanel
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : 'bg-blue-600 text-white border border-blue-700 hover:bg-blue-700'
                    }`}
                  >
                    {showAdminPanel ? '✕ Tutup Panel' : '⚙️ Perbarui Status'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {showAdminPanel && user?.role === 'ADMIN' && (
            <div className="mt-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-md p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-3">⚙️ PERBARUI STATUS & FEEDBACK</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Status Baru</label>
                  <div className="flex gap-2">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED')}
                      className="flex-1 px-3 py-2 border-2 border-blue-400 rounded-md bg-white text-gray-900 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="PENDING">🟡 PENDING</option>
                      <option value="IN_PROGRESS">🟠 IN_PROGRESS</option>
                      <option value="COMPLETED">🟢 COMPLETED</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-700 mt-2">Status sekarang: <span className="font-bold bg-white px-2 py-1 rounded">{translateStatus(report.status)}</span></p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Gambar Admin (opsional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="adminImageInput"
                      accept="image/*"
                      onChange={handleAdminImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <label
                      htmlFor="adminImageInput"
                      className="block px-4 py-3 border-2 border-dashed border-blue-400 rounded-md bg-white text-center cursor-pointer hover:bg-blue-50 transition font-medium"
                    >
                      <p className="text-sm font-semibold text-blue-700">
                        {adminImage ? `✓ ${adminImage.name}` : '📎 Pilih Gambar'}
                      </p>
                      <p className="text-xs text-gray-600">atau drag & drop gambar di sini</p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">Feedback Admin (opsional)</label>
                <textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  rows={3}
                  placeholder="Tambahkan komentar atau catatan kepada user..."
                />
              </div>

              {adminImagePreview && (
                <div className="mt-4 bg-white border-l-4 border-green-500 p-3 rounded">
                  <h4 className="text-sm font-bold text-green-700 mb-2">✓ Pratinjau Gambar Admin</h4>
                  <img
                    src={adminImagePreview}
                    alt="Admin preview"
                    className="h-40 w-auto rounded-md cursor-pointer hover:opacity-75 transition"
                    onClick={() => {
                      setLightboxSrc(adminImagePreview);
                      setLightboxOpen(true);
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-2">Klik untuk memperbesar</p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleAdminSubmit}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md hover:from-green-700 hover:to-green-800 transition disabled:from-gray-400 disabled:to-gray-500 font-bold shadow-md"
                >
                  {updating ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminPanel(false)}
                  className="inline-flex items-center justify-center px-4 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-md hover:bg-gray-100 transition font-medium"
                >
                  ✕ Batal
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Gambar Laporan</h3>
              {report.image ? (
                <img
                  src={`${ASSET_BASE_URL}/${report.image}`}
                  alt={report.title}
                  className="h-40 w-full object-cover rounded-md cursor-pointer"
                  onClick={() => {
                    setLightboxSrc(`${ASSET_BASE_URL}/${report.image}`);
                    setLightboxOpen(true);
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              ) : (
                <div className="h-40 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                  Belum ada gambar laporan
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Gambar Admin</h3>
              {report.adminImage ? (
                <img
                  src={`${ASSET_BASE_URL}/${report.adminImage}`}
                  alt="Admin feedback"
                  className="h-40 w-full object-cover rounded-md cursor-pointer"
                  onClick={() => {
                    setLightboxSrc(`${ASSET_BASE_URL}/${report.adminImage}`);
                    setLightboxOpen(true);
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              ) : (
                <div className="h-40 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                  Belum ada gambar admin
                </div>
              )}
            </div>
          </div>

          {/* Admin Feedback */}
          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Umpan Balik Admin</h3>
            <p className="text-sm text-gray-600 mt-2">
              Berikut adalah tanggapan dari admin terkait laporan Anda.
            </p>
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
              {report.adminFeedback ? (
                <p className="text-sm text-gray-900 whitespace-pre-line">
                  {report.adminFeedback}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Belum ada umpan balik dari admin.</p>
              )}
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-900">Status Terkini</h3>
            <p className="text-sm text-blue-700 mt-2">
              Laporan Anda saat ini dalam status <strong>{translateStatus(report.status)}</strong>.
            </p>
          </div>
        </div>
      </div>
        {/* Lightbox overlay */}
        {lightboxOpen && lightboxSrc && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            onClick={() => setLightboxOpen(false)}
          >
            <img
              src={lightboxSrc}
              alt="Preview"
              className="max-h-[90vh] max-w-[95vw] object-contain rounded shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
    </div>
  );
}
