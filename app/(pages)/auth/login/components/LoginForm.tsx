/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import authAPI from '@/lib/api/auth';
import { authStorage } from '@/lib/storage/authStorage';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);

      const response = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      authStorage.setToken(response.data.accessToken);

      authStorage.setUser(response.data.user);

      toast.success(`Selamat datang, ${response.data.user.name}!`, {
        description: `Login berhasil sebagai ${response.data.user.role}`,
        duration: 2000,
      });

      if (response.data.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }

      reset();
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat login';
      toast.error('Login Gagal', {
        description: errorMessage,
        duration: 3000,
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="nama@email.com"
              className={`w-full px-4 py-2 border-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition ${
                errors.email
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Password
            </label>
            <input
              {...register('password')}
              id="password"
              type="password"
              placeholder="Masukkan password Anda"
              className={`w-full px-4 py-2 border-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition ${
                errors.password
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Belum memiliki akun?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
