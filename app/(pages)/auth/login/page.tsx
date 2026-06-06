'use client';

import LoginForm from './components/LoginForm';
import { ProtectedRoute } from '@/lib/components/ProtectedRoute';

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <LoginForm />
      </div>
    </ProtectedRoute>
  );
}
