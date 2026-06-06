/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { registerSchema, type RegisterFormData } from '../schemas/registerSchema';
import authAPI from '@/lib/api/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success('Pendaftaran Berhasil!', {
        description: `Silahkan login dengan akun Anda`,
        duration: 2000,
      });

      setTimeout(() => {
        router.push('/auth/login');
      }, 500);

      reset();
    } catch (error: any) {
      const errorMessage = error.message || 'Terjadi kesalahan saat mendaftar';
      toast.error('Pendaftaran Gagal', {
        description: errorMessage,
        duration: 3000,
      });
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar</h1>
          <p className="text-gray-600">Buat akun baru untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Nama Lengkap
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder="Masukkan nama lengkap"
              className={`w-full px-4 py-2 border-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition ${
                errors.name
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

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
              placeholder="Minimal 6 karakter"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Konfirmasi Password
            </label>
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              placeholder="Masukkan ulang password"
              className={`w-full px-4 py-2 border-2 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition ${
                errors.confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-6"
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
            {isLoading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Sudah memiliki akun?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
