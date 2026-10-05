/**
 * Signup Page
 * PostgreSQL + JWT Account Registration with clean validation
 */
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button, FormField, Input, GlassCard, ThemeToggle } from '../components/ui';
import Logo from '../components/Logo';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await signup(data.name, data.email, data.password);
    if (result.success) {
      navigate('/vehicles/add');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#091122] text-slate-900 dark:text-slate-100 p-4 sm:p-8 transition-colors duration-200">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="inline-block">
          <Logo size="md" showTagline={false} />
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Centered Box */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <GlassCard className="p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Start tracking vehicle mileage, running costs, and maintenance.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-5">
              <AlertCircle size={16} className="flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full Name" error={errors.name?.message} required>
              <Input
                type="text"
                placeholder="Arjun Sharma"
                error={errors.name?.message}
                {...register('name')}
              />
            </FormField>

            <FormField label="Email Address" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="driver@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Password"
              error={errors.password?.message}
              required
              hint="At least 6 characters"
            >
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </FormField>

            <div className="pt-2">
              <Button type="submit" disabled={isLoading} fullWidth size="lg">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="text-center mt-5 text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-600">
        SAARTH · Your Vehicle Intelligence Buddy
      </div>
    </div>
  );
}
