'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/auth.service';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setApiError(null);
      // We strip out confirmPassword before sending to your backend
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      
      await registerUser(payload);
      router.push('/login?registered=true');
    } catch (error: any) {
      setApiError(
        error.response?.data?.message || 'Failed to register account. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-900/30 p-3 rounded-full mb-4">
            <Activity className="text-blue-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join LogIQ Monitoring</p>
        </div>

        {apiError && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                {...register('name')}
                className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                {...register('email')}
                className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="admin@logiq.local"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                {...register('password')}
                className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                {...register('confirmPassword')}
                className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
