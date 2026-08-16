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

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');

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
        className="w-full max-w-3xl flex rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(11,43,38,0.22)' }}
      >
        {/* LEFT — brand panel */}
        <div
          className="hidden md:flex md:w-[42%] relative flex-col justify-between p-9 overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0B2B26,#123A32)' }}
        >
          <div
            className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.22), transparent 70%)' }}
          />
          <div className="relative flex items-center gap-2.5">
            <Ring2Logo size={26} />
            <span className="font-display text-lg font-semibold" style={{ color: '#F4EFE6', letterSpacing: '-0.01em' }}>
              Lead 2 HVAC
            </span>
          </div>

          <div className="relative">
            <h2 className="font-display text-2xl font-semibold leading-snug mb-3" style={{ color: '#F4EFE6' }}>
              Set up your AI<br />receptionist in minutes.
            </h2>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(244,239,230,0.55)' }}>
              No credit card, no long setup — just a few details and you're ready to stop missing calls.
            </p>

            <div
              className="float mt-8 rounded-xl p-4 max-w-xs"
              style={{ background: 'rgba(244,239,230,0.06)', border: '1px solid rgba(212,168,83,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4A853' }} />
                <span className="font-mono text-[10px] tracking-wide" style={{ color: 'rgba(244,239,230,0.5)' }}>Setup checklist</span>
              </div>
              <p className="text-xs mb-1" style={{ color: '#F4EFE6' }}>✓ Create your account</p>
              <p className="text-xs mb-1" style={{ color: 'rgba(244,239,230,0.5)' }}>○ Connect your AI assistant</p>
              <p className="text-xs" style={{ color: 'rgba(244,239,230,0.35)' }}>○ Start taking calls</p>
            </div>
          </div>

          <div className="relative" />
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 p-9 md:p-11" style={{ background: '#FBF9F5' }}>
          <div className="md:hidden flex items-center gap-2.5 mb-7">
            <Ring2Logo size={24} />
            <span className="font-display text-base font-semibold" style={{ color: '#1F2B27' }}>Lead 2 HVAC</span>
          </div>

          <p className="font-mono text-xs tracking-widest uppercase mb-2 font-semibold" style={{ color: '#B8863A' }}>
            Get started
          </p>
          <h1 className="font-display text-2xl font-semibold mb-1" style={{ color: '#1F2B27' }}>Create your account</h1>
          <p className="text-sm mb-7" style={{ color: '#7A8B85' }}>Set up your business in a couple of minutes.</p>

          {error && (
            <div className="mb-5 rounded-xl p-3 text-sm" style={{ background: '#FDF0EC', border: '1px solid #F5D5CA', color: '#B4432E' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2B27' }}>Company Name</label>
              <input
  type="text"
  required
  placeholder="ABC HVAC Services"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  className="w-full rounded-xl px-4 py-3 text-sm bg-[#2A3B35] transition"
  style={{ border: '1px solid rgba(31,43,39,0.14)', color: '#F4EFE6' }}
/>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2B27' }}>Email</label>
              <input
  type="email"
  required
  placeholder="you@company.com"
  value={form.email}
  onChange={(e) => setForm({ ...form, email: e.target.value })}
  className="w-full rounded-xl px-4 py-3 text-sm bg-[#2A3B35] transition"
  style={{ border: '1px solid rgba(31,43,39,0.14)', color: '#F4EFE6' }}
/>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2B27' }}>Password</label>
              <div className="relative">
                <input
  type={showPassword ? 'text' : 'password'}
  required
  minLength={6}
  placeholder="At least 6 characters"
  value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
  className="w-full rounded-xl px-4 py-3 pr-11 text-sm bg-[#2A3B35] transition"
  style={{ border: '1px solid rgba(31,43,39,0.14)', color: '#F4EFE6' }}
/>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: '#9AA39D' }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="submit-btn mt-2 py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#0B2B26,#173F37)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-7" style={{ color: '#7A8B85' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#B8863A', fontWeight: 600 }}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}