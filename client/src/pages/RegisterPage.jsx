import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import authApi from '../services/auth.api.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const RegisterPage = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.register({
        ...data,
        timezone: detectedTimezone,
      });
      setUser(res.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-text-primary">
          Create Account
        </h2>
        <p className="text-xs text-slate-500 dark:text-text-muted mt-1">
          Start tracking with genuine metrics and data-driven routines.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. Alex Mercer"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@domain.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="text-[11px] text-slate-400 dark:text-text-dim">
          Detected timezone: <span className="font-mono">{detectedTimezone}</span>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          isLoading={isLoading}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
