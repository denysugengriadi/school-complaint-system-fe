'use client';

import LoginForm from './components/LoginForm';
import { ProtectedRoute } from '@/lib/components/ProtectedRoute';

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg-school-complaint-system.jpeg')" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
          <LoginForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
