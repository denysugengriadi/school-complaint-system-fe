import axios from 'axios';
import { authStorage } from '@/lib/storage/authStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '') || API_BASE_URL;

export interface Report {
  id: number;
  title: string;
  description: string;
  type: 'COMPLAINT' | 'SUGGESTION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  image: string | null;
  adminFeedback: string | null;
  adminImage: string | null;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateReportRequest {
  title: string;
  description: string;
  type: 'COMPLAINT' | 'SUGGESTION';
}

export interface UpdateReportStatusRequest {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  adminFeedback?: string | undefined;
  adminImage?: File;
}

export interface ReportsResponse {
  data: Report[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ReportsQuery {
  search?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

const getAuthHeaders = (): { Authorization?: string; 'Content-Type'?: string } => {
  const token = authStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const reportAPI = {
  createReport: async (
    reportData: CreateReportRequest,
    image?: File
  ): Promise<ApiResponse<Report>> => {
    try {
      const formData = new FormData();
      formData.append('title', reportData.title);
      formData.append('description', reportData.description);
      formData.append('type', reportData.type);
      if (image) {
        formData.append('image', image);
      }

      const token = authStorage.getToken();
      const response = await axios.post<ApiResponse<Report>>(
        `${API_BASE_URL}/reports`,
        formData,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            'Gagal membuat laporan, silahkan coba lagi',
          statusCode: error.response?.status,
        };
      }
      throw error;
    }
  },

  getReports: async (
    page: number = 1,
    limit: number = 10,
    query: ReportsQuery = {}
  ): Promise<ApiResponse<ReportsResponse>> => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (query.search) params.append('search', query.search);
      if (query.status) params.append('status', query.status);
      if (query.startDate) params.append('startDate', query.startDate);
      if (query.endDate) params.append('endDate', query.endDate);

      const response = await axios.get<ApiResponse<ReportsResponse>>(
        `${API_BASE_URL}/reports?${params.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.log('error', error);
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            'Gagal mengambil data laporan, silahkan coba lagi',
          statusCode: error.response?.status,
        };
      }
      throw error;
    }
  },

  getReportById: async (id: number): Promise<ApiResponse<Report>> => {
    try {
      const response = await axios.get<ApiResponse<Report>>(
        `${API_BASE_URL}/reports/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            'Gagal mengambil detail laporan, silahkan coba lagi',
          statusCode: error.response?.status,
        };
      }
      throw error;
    }
  },

  updateReportStatus: async (
    id: number,
    statusData: UpdateReportStatusRequest
  ): Promise<ApiResponse<Report>> => {
    try {
      let requestData: UpdateReportStatusRequest | FormData = statusData;
      let headers = getAuthHeaders();

      if (statusData.adminFeedback !== undefined || statusData.adminImage) {
        const formData = new FormData();
        formData.append('status', statusData.status);
        if (statusData.adminFeedback !== undefined) {
          formData.append('adminFeedback', statusData.adminFeedback);
        }
        if (statusData.adminImage) {
          formData.append('adminImage', statusData.adminImage);
        }
        requestData = formData;
        const restHeaders = { ...headers };
        delete restHeaders['Content-Type'];
        headers = restHeaders;
      }

      const response = await axios.patch<ApiResponse<Report>>(
        `${API_BASE_URL}/reports/${id}/status`,
        requestData,
        {
          headers,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            'Gagal memperbarui status laporan, silahkan coba lagi',
          statusCode: error.response?.status,
        };
      }
      throw error;
    }
  },

  deleteReport: async (id: number): Promise<ApiResponse<Report>> => {
    try {
      const response = await axios.delete<ApiResponse<Report>>(
        `${API_BASE_URL}/reports/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message:
            error.response?.data?.message ||
            'Gagal menghapus laporan, silahkan coba lagi',
          statusCode: error.response?.status,
        };
      }
      throw error;
    }
  },
};
