import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '../store/themeStore.js';

// TanStack Query configured without application caching layer
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data on mount/invalidation
      gcTime: 1000 * 60 * 2, // Minimal garbage collection window
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const Providers = ({ children }) => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: isDark ? '#1a1d28' : '#ffffff',
            color: isDark ? '#f1f2f7' : '#0f172a',
            border: isDark ? '1px solid #252840' : '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          },
          success: {
            iconTheme: {
              primary: '#22d3a0',
              secondary: isDark ? '#1a1d28' : '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: isDark ? '#1a1d28' : '#ffffff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default Providers;
