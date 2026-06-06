import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

interface LoginAuthData {
  accessToken: string;
  user: User;
}

interface AuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LoginAuthData;
}

const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.message || 'Login gagal, silahkan coba lagi',
          statusCode: error.response?.status,
        };
      }
      throw error;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/register`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.message || 'Pendaftaran gagal, silahkan coba lagi',
          statusCode: error.response?.status,
        };
      }
      throw error;
    }
  },
};

export default authAPI;
