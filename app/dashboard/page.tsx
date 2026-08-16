'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch, isLoggedIn } from '@/lib/auth';
import Sidebar from '../components/Sidebar';

type DashboardStats = {
  revenue: number;
  answered_calls: number;
  jobs_booked: number;
  callbacks: number;
};

type Lead = {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string | null;
  issue: string;
  status: string;
  appointment_time: string | null;
  estimated_value: number | null;
};

function statusPill(status: string) {
  if (status === 'booked') return { label: 'Booked', bg: '#E4EFE8', color: '#2F6B4F' };
  if (status === 'callback') return { label: 'Callback', bg: '#FBEAE3', color: '#B4522E' };
  if (status === 'new') return { label: 'New', bg: '#F1EADA', color: '#8A6B2E' };
  return { label: status, bg: '#EFEEEA', color: '#7A8B85' };
}

const PhoneIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const TrendIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);
const CheckIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertIcon = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const MailIcon = ({ color }: { color: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" opacity="0" />
    <path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V6z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);
const SmallPhoneIcon = ({ color }: { color: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [statsRes, leadsRes] = await Promise.all([authFetch('/dashboard'), authFetch('/leads')]);
        if (!statsRes.ok || !leadsRes.ok) throw new Error('Backend did not respond correctly');
        setStats(await statsRes.json());
        setLeads([...(await leadsRes.json())].reverse());
      } catch (err) {
        console.error(err);
        setError('Could not load data from the server.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const needsAttention = leads.filter((l) => l.status === 'callback');
  const recentCalls = leads.slice(0, 6);

  const cards = [
    { label: 'AI Answered Calls', value: stats ? stats.answered_calls.toString() : null, Icon: PhoneIcon, dark: false },
    { label: 'Revenue Recovered', value: stats ? `$${stats.revenue.toLocaleString()}` : null, Icon: TrendIcon, dark: true },
    { label: 'Jobs Booked', value: stats ? stats.jobs_booked.toString() : null, Icon: CheckIcon, dark: false },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F1E9', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .stat-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 16px 30px -14px rgba(15,51,44,0.18); }
        .call-row { transition: background 0.15s ease; }
        .call-row:hover { background: #FAF8F2; }
        .call-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 16px -6px rgba(180,82,46,0.4); }
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        .skeleton { background: linear-gradient(90deg, #EAE6DA 25%, #F1EEE3 37%, #EAE6DA 63%); background-size: 400px 100%; animation: shimmer 1.4s infinite linear; border-radius: 6px; }
        @keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .pulse { animation: pulseDot 1.6s ease-in-out infinite; }
        @media (max-width: 767px) {
          main { min-width: 0; }
          .call-row { min-width: 0; }
        }
      `}</style>

      <Sidebar active="dashboard" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-11 pb-28 sm:pb-6 md:pb-8 lg:pb-11 max-w-6xl mx-auto w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-9 gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-widest uppercase mb-2.5 font-bold" style={{ color: '#B8863A' }}>Overview</p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-[2.3rem] font-semibold tracking-tight" style={{ color: '#1F2B27' }}>
              Good to see you
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#8A9690' }}>Here's how your AI receptionist is performing.</p>
          </div>
          <div
            className="flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded-full self-start sm:self-auto"
            style={{ background: '#fff', border: '1px solid rgba(31,43,39,0.08)' }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!loading ? 'pulse' : ''}`} style={{ background: loading ? '#D8D2C2' : '#3F8A5D' }} />
            <span style={{ color: loading ? '#B0AA98' : '#3F8A5D' }}>{loading ? 'Refreshing' : 'Live'}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl p-4 text-sm" style={{ background: '#FBEAE3', border: '1px solid #F0CFC0', color: '#B4522E' }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mb-6">
          {cards.map((c) => (
            <div
              key={c.label}
              className="stat-card rounded-2xl p-4 sm:p-6"
              style={c.dark
                ? { background: 'linear-gradient(160deg,#0B2B26,#173F37)', color: '#F4EFE6' }
                : { background: '#fff', border: '1px solid rgba(31,43,39,0.07)' }}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <p className="text-xs font-medium" style={{ color: c.dark ? 'rgba(244,239,230,0.6)' : '#9AA39D' }}>{c.label}</p>
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: c.dark ? 'rgba(212,168,83,0.16)' : '#F4F1E9' }}
                >
                  <c.Icon color={c.dark ? '#D4A853' : '#1F2B27'} />
                </div>
              </div>
              {c.value === null ? (
                <div className="skeleton h-8 sm:h-9 w-24" />
              ) : (
                <h2 className="font-display text-2xl sm:text-3xl font-semibold" style={{ color: c.dark ? '#F4EFE6' : '#1F2B27' }}>{c.value}</h2>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 min-w-0">
          {/* Needs attention */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: '#fff', border: '1px solid rgba(31,43,39,0.07)' }}>
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <AlertIcon color="#B4522E" />
              <h2 className="font-display text-base font-semibold" style={{ color: '#1F2B27' }}>Needs Attention</h2>
              {needsAttention.length > 0 && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FBEAE3', color: '#B4522E' }}>
                  {needsAttention.length}
                </span>
              )}
            </div>

            {needsAttention.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: '#B0AA98' }}>Nothing needs attention right now.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {needsAttention.map((lead) => (
                <div key={lead.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 rounded-xl p-4" style={{ background: '#F4F1E9' }}>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate" style={{ color: '#1F2B27' }}>{lead.customer_name}</h3>
                    <p className="text-xs truncate mt-0.5" style={{ color: '#9AA39D' }}>{lead.issue}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] font-mono" style={{ color: '#7A8B85' }}>
                        <SmallPhoneIcon color="#7A8B85" />
                        {lead.phone_number}
                      </span>
                      {lead.email && (
                        <span className="flex items-center gap-1 text-[11px] font-mono truncate" style={{ color: '#7A8B85' }}>
                          <MailIcon color="#7A8B85" />
                          {lead.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={`tel:${lead.phone_number}`}
                    className="call-btn shrink-0 w-full sm:w-auto text-center px-4 py-2 rounded-lg text-xs font-bold text-white transition"
                    style={{ background: '#B4522E' }}
                  >
                    Call Now
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Recent calls */}
          <div className="rounded-2xl p-4 sm:p-6" style={{ background: '#fff', border: '1px solid rgba(31,43,39,0.07)' }}>
            <h2 className="font-display text-base font-semibold mb-4 sm:mb-5" style={{ color: '#1F2B27' }}>Recent Calls</h2>

            {recentCalls.length === 0 && !loading && (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: '#B0AA98' }}>No leads yet. They'll show up here as soon as a call comes in.</p>
              </div>
            )}

            <div className="flex flex-col">
              {recentCalls.map((lead, idx) => {
                const s = statusPill(lead.status);
                return (
                  <div
                    key={lead.id}
                    className="call-row flex flex-wrap items-center justify-between gap-y-2 py-3.5 px-2 -mx-2 rounded-lg"
                    style={{ borderTop: idx !== 0 ? '1px solid #F0EEE6' : 'none' }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-semibold shrink-0"
                        style={{ background: '#F4F1E9', color: '#1F2B27' }}
                      >
                        {lead.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate" style={{ color: '#1F2B27' }}>{lead.customer_name}</h3>
                        <p className="text-xs truncate" style={{ color: '#000000' }}>{lead.issue}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className="flex items-center gap-1 text-[11px] font-mono truncate" style={{ color: '#000000' }}>
                            <SmallPhoneIcon color="#B0AA98" />
                            {lead.phone_number}
                          </span>
                          {lead.email && (
                            <span className="flex items-center gap-1 text-[11px] font-mono truncate" style={{ color: '#000000' }}>
                              <MailIcon color="#B0AA98" />
                              {lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 ml-3 font-mono text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}