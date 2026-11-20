import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import authApi from '../services/auth.api.js';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';
import { LogIn, KeyRound } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.login(data);
      setUser(res.data.user);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setValue('email', 'demo@habitos.app');
    setValue('password', 'Password123!');
    toast('Demo credentials populated!', { icon: '🔑' });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-warm-900 dark:text-warm-100">
          Sign In
        </h2>
        <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
          Access your personal habit dashboard and routine metrics.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          className="w-full mt-2 py-3"
          size="lg"
          isLoading={isLoading}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </form>

      {/* Demo Credentials Quick Button */}
      <div className="mt-5 pt-4 border-t border-warm-100 dark:border-surface-700">
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="w-full flex items-center justify-center py-2.5 px-3 text-xs font-bold rounded-full bg-peach-light dark:bg-surface-700 hover:bg-peach text-coral dark:text-coral-300 border border-coral/20 transition-colors cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 mr-2" />
          Fill Demo Account (Alex Mercer)
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-warm-500 dark:text-warm-400">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-coral hover:underline"
        >
          Create one now
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
