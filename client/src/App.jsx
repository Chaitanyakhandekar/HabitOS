import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.jsx';
import Providers from './app/providers.jsx';
import { useAuthStore } from './store/authStore.js';
import authApi from './services/auth.api.js';

export function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (res?.data?.user) {
          setUser(res.data.user);
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [setUser, clearUser, setLoading]);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
