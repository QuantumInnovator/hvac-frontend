'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE, saveToken } from '@/lib/auth';

function Ring2Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <circle cx="10" cy="13" r="7" fill="none" stroke="#D4A853" strokeWidth="2" />
      <circle cx="17" cy="13" r="7" fill="none" stroke="#F4EFE6" strokeWidth="2" opacity="0.9" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.set('username', form.email);
      body.set('password', form.password);

      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      saveToken(data.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#EDE7DC', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        input:focus { outline: none; border-color: #B8863A !important; box-shadow: 0 0 0 3px rgba(184,134,58,0.15); }
        .submit-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 24px -8px rgba(11,43,38,0.4); }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .float { animation: floatY 3.6s ease-in-out infinite; }
      `}</style>

      <div
        className="w-full max-w-2xl flex rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(11,43,38,0.22)' }}
      >
        {/* LEFT — brand panel */}
        <div
          className="hidden md:flex md:w-[42%] relative flex-col justify-between p-10 overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0B2B26,#123A32)' }}
        >
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.22), transparent 70%)' }}
          />
          <div className="relative flex items-center gap-3">
            <Ring2Logo size={30} />
            <span className="font-display text-xl font-semibold" style={{ color: '#F4EFE6', letterSpacing: '-0.01em' }}>
              Lead 2 HVAC
            </span>
          </div>

          <div className="relative">
            <h2 className="font-display text-[26px] font-semibold leading-snug mb-4" style={{ color: '#F4EFE6' }}>
              Every call answered.<br />Every job saved.
            </h2>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(244,239,230,0.55)' }}>
              Log back in to see what your AI receptionist handled while you were away.
            </p>

            <div
              className="float mt-9 rounded-xl p-5 max-w-xs"
              style={{ background: 'rgba(244,239,230,0.06)', border: '1px solid rgba(212,168,83,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4A853' }} />
                <span className="font-mono text-[11px] tracking-wide" style={{ color: 'rgba(244,239,230,0.5)' }}>11:42 PM</span>
              </div>
              <p className="text-sm mb-2" style={{ color: '#F4EFE6' }}>"My furnace won't turn on."</p>
              <p className="font-mono text-[11px] font-semibold" style={{ color: '#D4A853' }}>✓ Booked · Emergency</p>
            </div>
          </div>

          <div className="relative" />
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 p-10 md:p-12" style={{ background: '#FBF9F5' }}>
          <div className="md:hidden flex items-center gap-2.5 mb-8">
            <Ring2Logo size={26} />
            <span className="font-display text-lg font-semibold" style={{ color: '#1F2B27' }}>Lead2HVAC</span>
          </div>

          <p className="font-mono text-xs tracking-widest uppercase mb-2.5 font-bold" style={{ color: '#B8863A' }}>
            Welcome back
          </p>
          <h1 className="font-display text-[28px] font-semibold mb-2" style={{ color: '#1F2B27' }}>Log in</h1>
          <p className="text-sm mb-8" style={{ color: '#7A8B85' }}>Access your dashboard and call history.</p>

          {error && (
            <div className="mb-5 rounded-xl p-3 text-sm" style={{ background: '#FDF0EC', border: '1px solid #F5D5CA', color: '#B4432E' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1F2B27' }}>Email</label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl px-4 py-3.5 text-base bg-white transition"
                style={{ border: '1px solid rgba(31,43,39,0.14)', color: '#1F2B27' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1F2B27' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl px-4 py-3.5 pr-12 text-base bg-white transition"
                  style={{ border: '1px solid rgba(31,43,39,0.14)', color: '#1F2B27' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: '#9AA39D' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="submit-btn mt-2 py-3.5 rounded-xl font-bold text-base text-white"
              style={{ background: 'linear-gradient(135deg,#0B2B26,#173F37)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: '#7A8B85' }}>
            Don&apos;t have an account?{' '}
            <a href="/signup" style={{ color: '#B8863A', fontWeight: 700 }}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}