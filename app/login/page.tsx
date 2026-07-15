'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { ChefHat, Eye, EyeOff } from 'lucide-react';

const inputClass =
  'mt-1 block min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.replace('/pos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <ChefHat className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Kitchen POS</h1>
          <p className="mt-1 text-sm text-ink-muted">Masuk untuk membuka POS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-ink">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-1 top-1/2 flex min-h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Login
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Default admin: <strong>admin</strong> / <strong>admin</strong>
        </p>
      </div>
    </div>
  );
}
