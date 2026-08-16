'use client';
import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Building2, PhoneForwarded, Clock, MessageSquare, Check, Copy } from 'lucide-react';
import { authFetch, isLoggedIn } from '@/lib/auth';
import Sidebar from '../components/Sidebar';

type SettingsData = {
  company_name: string;
  owner_name: string;
  business_phone: string;
  forward_number: string;
  business_email: string;
  working_hours: string;
  greeting_script: string;
};

type MeData = {
  id: number;
  name: string;
  email: string;
  api_key: string;
  webhook_url: string;
};

function Field({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="min-w-0">
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2B27' }}>{label}</label>
      <input
        {...props}
        className="w-full rounded-xl px-3 sm:px-4 py-3 text-sm outline-none transition"
        style={{ border: '1px solid rgba(31,43,39,0.12)', color: '#1F2B27', background: '#fff' }}
        onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(184,134,58,0.18)'; e.target.style.borderColor = '#B8863A'; }}
        onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(31,43,39,0.12)'; }}
      />
      {hint && <p className="text-xs mt-1.5" style={{ color: '#9AA39D' }}>{hint}</p>}
    </div>
  );
}

function SectionCard({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl p-4 sm:p-6 md:p-8" style={{ background: '#fff', border: '1px solid rgba(31,43,39,0.07)' }}>
      <div className="flex items-start gap-3 mb-5 sm:mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F4F1E9' }}>{icon}</div>
        <div className="min-w-0">
          <h2 className="font-display text-base sm:text-lg font-semibold" style={{ color: '#1F2B27' }}>{title}</h2>
          {description && <p className="text-sm mt-0.5" style={{ color: '#8A9690' }}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const defaultSettings: SettingsData = {
  company_name: '',
  owner_name: '',
  business_phone: '',
  forward_number: '',
  business_email: '',
  working_hours: '9:00 AM – 6:00 PM',
  greeting_script: 'Hello! Thank you for calling. How can I help you today?',
};

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SettingsData>(defaultSettings);
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    async function loadAll() {
      try {
        const [settingsRes, meRes] = await Promise.all([authFetch('/settings'), authFetch('/me')]);
        if (settingsRes.ok) setForm(await settingsRes.json());
        if (meRes.ok) setMe(await meRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [router]);

  function update<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaveState('saving');
    try {
      const res = await authFetch('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveState('saved');
    } catch (err) {
      console.error(err);
      setSaveState('error');
    } finally {
      setTimeout(() => setSaveState('idle'), 2200);
    }
  }

  function handleCopyWebhook() {
    if (!me) return;
    const fullUrl = `${window.location.origin.includes('localhost') ? 'https://hvac-backend-production-c861.up.railway.app' : ''}${me.webhook_url}`;
    navigator.clipboard.writeText(`https://hvac-backend-production-c861.up.railway.app${me.webhook_url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F1E9', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        textarea:focus, input:focus { outline: none; }
        button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
          outline: 2px solid #B8863A; outline-offset: 2px; border-radius: 8px;
        }
        .save-btn { transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease; }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 16px -6px rgba(31,43,39,0.25); }
      `}</style>

      <Sidebar active="settings" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-11 max-w-4xl mx-auto w-full pb-28 overflow-x-hidden">
        <div className="mb-6 sm:mb-9">
          <p className="font-mono text-[11px] tracking-widest uppercase mb-2.5 font-bold" style={{ color: '#B8863A' }}>
            Business Configuration
          </p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-[2.3rem] font-semibold tracking-tight" style={{ color: '#1F2B27' }}>
            Settings
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#8A9690' }}>
            {loading ? 'Loading your settings…' : 'Manage your HVAC business information and how the AI represents you on the phone.'}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Webhook URL card */}
          {me && (
            <SectionCard
              icon={<PhoneForwarded size={18} color="#1F2B27" />}
              title="Your Webhook URL"
              description="Paste this into your create_lead Function Tool's Server URL in Vapi."
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                <code
                  className="flex-1 min-w-0 text-[11px] sm:text-xs font-mono px-3 sm:px-4 py-3 rounded-xl overflow-x-auto"
                  style={{ background: '#F4F1E9', color: '#1F2B27' }}
                >
                  https://hvac-backend-production-c861.up.railway.app{me.webhook_url}
                </code>
                <button
                  onClick={handleCopyWebhook}
                  className="save-btn flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-xs text-white shrink-0 w-full sm:w-auto"
                  style={{ background: copied ? '#2F6B4F' : '#1F2B27' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={<Building2 size={18} color="#1F2B27" />}
            title="Business Information"
            description="How your company is identified to callers."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Company Name" type="text" placeholder="ABC HVAC Services" value={form.company_name} onChange={(e) => update('company_name', e.target.value)} />
              <Field label="Owner Name" type="text" placeholder="John Rivera" value={form.owner_name} onChange={(e) => update('owner_name', e.target.value)} />
            </div>
          </SectionCard>

          <SectionCard
            icon={<PhoneForwarded size={18} color="#1F2B27" />}
            title="Contact & Routing"
            description="Where calls and messages go when a human needs to step in."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Business Phone" type="text" placeholder="+1 312 555 1234" value={form.business_phone} onChange={(e) => update('business_phone', e.target.value)} />
              <Field label="Forward Number" type="text" placeholder="+1 312 555 9876" value={form.forward_number} onChange={(e) => update('forward_number', e.target.value)} hint="Calls flagged as urgent ring this number after the AI." />
              <div className="md:col-span-2">
                <Field label="Business Email" type="email" placeholder="info@abchvac.com" value={form.business_email} onChange={(e) => update('business_email', e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Clock size={18} color="#1F2B27" />}
            title="Availability"
            description="The AI mentions these hours and offers a callback outside them."
          >
            <Field label="Working Hours" type="text" placeholder="9:00 AM – 6:00 PM" value={form.working_hours} onChange={(e) => update('working_hours', e.target.value)} />
          </SectionCard>

          <SectionCard
            icon={<MessageSquare size={18} color="#1F2B27" />}
            title="AI Receptionist"
            description="The first thing a caller hears — keep it short and warm."
          >
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#1F2B27' }}>Greeting Script</label>
            <textarea
              rows={5}
              value={form.greeting_script}
              onChange={(e) => update('greeting_script', e.target.value)}
              maxLength={220}
              className="w-full rounded-xl px-3 sm:px-4 py-3 text-sm outline-none resize-none transition"
              style={{ border: '1px solid rgba(31,43,39,0.12)', color: '#1F2B27', background: '#fff' }}
              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(184,134,58,0.18)'; e.target.style.borderColor = '#B8863A'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'rgba(31,43,39,0.12)'; }}
            />
            <div className="flex flex-col xs:flex-row justify-between gap-1 mt-1.5">
              <p className="text-xs" style={{ color: '#9AA39D' }}>Read aloud, so plain language works best.</p>
              <p className="font-mono text-xs shrink-0" style={{ color: form.greeting_script.length > 200 ? '#B4522E' : '#9AA39D' }}>
                {form.greeting_script.length}/220
              </p>
            </div>
          </SectionCard>
        </div>
      </main>

      {/* Bottom save bar */}
      <div
        className="fixed bottom-0 right-0 flex justify-stretch sm:justify-end px-4 sm:px-6 md:px-10 py-3 sm:py-4"
        style={{
          left: '76px',
          background: 'rgba(244,241,233,0.9)',
          backdropFilter: 'blur(6px)',
          borderTop: '1px solid rgba(31,43,39,0.08)',
        }}
      >
        <button
          onClick={handleSave}
          disabled={saveState !== 'idle' || loading}
          className="save-btn flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm text-white w-full sm:w-auto"
          style={{
            background:
              saveState === 'saved' ? '#2F6B4F' :
              saveState === 'error' ? '#B4522E' :
              '#1F2B27',
          }}
        >
          {saveState === 'saved' ? <Check size={18} /> : <Save size={18} />}
          {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Failed — try again' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}