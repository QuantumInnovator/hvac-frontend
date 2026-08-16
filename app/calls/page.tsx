'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { authFetch, isLoggedIn } from '@/lib/auth';
import Sidebar from '../components/Sidebar';

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

type CallStatus = 'booked' | 'attention' | 'answered' | 'missed';

type Call = {
  id: string;
  name: string;
  service: string;
  status: CallStatus;
  time: string;
  phone: string;
  email: string | null;
};

const statusConfig: Record<CallStatus, { label: string; bg: string; color: string }> = {
  booked: { label: 'Booked', bg: '#E4EFE8', color: '#2F6B4F' },
  attention: { label: 'Needs Attention', bg: '#FBEAE3', color: '#B4522E' },
  answered: { label: 'AI Answered', bg: '#F1EADA', color: '#8A6B2E' },
  missed: { label: 'Missed', bg: '#EFEEEA', color: '#7A8B85' },
};

const filters = [
  { key: 'all', label: 'All' },
  { key: 'booked', label: 'Booked' },
  { key: 'attention', label: 'Needs Attention' },
  { key: 'answered', label: 'AI Answered' },
  { key: 'missed', label: 'Missed' },
];

function mapStatus(backendStatus: string): CallStatus {
  if (backendStatus === 'booked') return 'booked';
  if (backendStatus === 'callback') return 'attention';
  if (backendStatus === 'new') return 'answered';
  return 'missed';
}

function formatTime(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SmallPhoneIcon = ({ color }: { color: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = ({ color }: { color: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V6z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

export default function CallsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    async function loadLeads() {
      try {
        setLoading(true);
        setError(null);
        const res = await authFetch('/leads');
        if (!res.ok) throw new Error('Failed to load leads');
        const data: Lead[] = await res.json();

        const mapped: Call[] = data
          .slice()
          .reverse()
          .map((lead) => ({
            id: String(lead.id),
            name: lead.customer_name || 'Unknown',
            service: lead.issue || '—',
            status: mapStatus(lead.status),
            time: formatTime(lead.appointment_time),
            phone: lead.phone_number,
            email: lead.email,
          }));

        setCalls(mapped);
      } catch (err) {
        console.error(err);
        setError('Could not load calls from the server.');
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
    const interval = setInterval(loadLeads, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const filtered = calls.filter((c) => {
    const matchesFilter = activeFilter === 'all' || c.status === activeFilter;
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: '#F4F1E9', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .filter-pill { transition: all 0.15s ease; }
        .call-row { transition: background 0.15s ease; }
        .call-row:hover { background: #FAF8F2; }
        .action-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .action-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 16px -6px rgba(180,82,46,0.35); }
        .search-input { transition: box-shadow 0.15s ease, border-color 0.15s ease; }
        .search-input:focus { border-color: #D4A853; box-shadow: 0 0 0 3px rgba(212,168,83,0.18); }
        button:focus-visible, input:focus-visible, a:focus-visible {
          outline: 2px solid #D4A853; outline-offset: 2px; border-radius: 8px;
        }
        @media (max-width: 767px) {
          main { min-width: 0; }
          .mobile-call-card { position: relative; z-index: 1; }
          .mobile-call-action { position: relative; z-index: 2; touch-action: manipulation; }
        }
        @media (max-width: 374px) {
          main { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      <Sidebar active="calls" />

      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-11 pb-32 sm:pb-8 max-w-6xl mx-auto w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-9 gap-4 min-w-0">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-widest uppercase mb-2.5 font-bold" style={{ color: '#B8863A' }}>
              {loading ? 'Loading…' : `${filtered.length} of ${calls.length} calls`}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-[2.3rem] font-semibold tracking-tight" style={{ color: '#1F2B27' }}>Calls</h1>
            <p className="mt-2 text-sm" style={{ color: '#8A9690' }}>Every customer call handled by your AI receptionist.</p>
          </div>

          <label className="relative w-full sm:w-auto shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={17} color="#9AA39D" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer..."
              aria-label="Search calls by customer name"
              className="search-input pl-10 pr-4 py-3 rounded-xl bg-white outline-none w-full sm:w-72 text-sm min-w-0"
              style={{ border: '1px solid rgba(31,43,39,0.08)', color: '#1F2B27' }}
            />
          </label>
        </div>

        {error && (
          <div className="mb-6 rounded-xl p-3 sm:p-4 text-sm min-w-0" style={{ background: '#FBEAE3', border: '1px solid #F0CFC0', color: '#B4522E' }}>
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 mb-5 min-w-0 overflow-x-auto pb-1 -mx-1 px-1">
          <Filter size={14} color="#9AA39D" aria-hidden="true" className="shrink-0" />
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className="filter-pill font-mono text-xs px-3 sm:px-3.5 py-1.5 rounded-full font-semibold shrink-0 whitespace-nowrap"
              style={activeFilter === f.key
                ? { background: 'linear-gradient(160deg,#0B2B26,#173F37)', color: '#F4EFE6' }
                : { background: '#fff', color: '#8A9690', border: '1px solid rgba(31,43,39,0.08)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block rounded-2xl overflow-hidden min-w-0" style={{ background: '#fff', border: '1px solid rgba(31,43,39,0.07)' }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr style={{ background: '#F4F1E9' }}>
                  <th className="text-left font-mono font-medium uppercase tracking-wide text-xs p-5" style={{ color: '#9AA39D' }}>Customer</th>
                  <th className="text-left font-mono font-medium uppercase tracking-wide text-xs" style={{ color: '#9AA39D' }}>Contact</th>
                  <th className="text-left font-mono font-medium uppercase tracking-wide text-xs" style={{ color: '#9AA39D' }}>Service</th>
                  <th className="text-left font-mono font-medium uppercase tracking-wide text-xs" style={{ color: '#9AA39D' }}>Status</th>
                  <th className="text-left font-mono font-medium uppercase tracking-wide text-xs" style={{ color: '#9AA39D' }}>Time</th>
                  <th className="text-right font-mono font-medium uppercase tracking-wide text-xs pr-5" style={{ color: '#9AA39D' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((call) => {
                  const s = statusConfig[call.status];
                  const urgent = call.status === 'attention' || call.status === 'missed';
                  return (
                    <tr key={call.id} className="call-row border-t" style={{ borderColor: '#F0EEE6' }}>
                      <td className="p-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0" style={{ background: '#F4F1E9', color: '#1F2B27' }} aria-hidden="true">
                            {call.name.charAt(0)}
                          </div>
                          <span className="font-semibold truncate" style={{ color: '#1F2B27' }}>{call.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="flex items-center gap-1.5 text-xs font-mono min-w-0" style={{ color: '#5C6B65' }}>
                            <SmallPhoneIcon color="#9AA39D" />
                            <span className="truncate">{call.phone}</span>
                          </span>
                          {call.email && (
                            <span className="flex items-center gap-1.5 text-xs font-mono min-w-0" style={{ color: '#5C6B65' }}>
                              <MailIcon color="#9AA39D" />
                              <span className="truncate">{call.email}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="max-w-55 truncate" style={{ color: '#5C6B65' }}>{call.service}</td>
                      <td>
                        <span className="font-mono text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td className="font-mono text-xs whitespace-nowrap" style={{ color: '#9AA39D' }}>{call.time}</td>
                      <td className="text-right pr-5">
                        <a
                          href={`tel:${call.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="action-btn inline-block font-bold px-4 py-2 rounded-lg text-xs text-white"
                          style={urgent ? { background: '#B4522E' } : { background: '#173F37' }}
                        >
                          {call.status === 'missed' ? 'Callback' : call.status === 'attention' ? 'Call' : 'View'}
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-14" style={{ color: '#B0AA98' }}>No calls match this search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden flex flex-col gap-3 min-w-0">
          {filtered.map((call) => {
            const s = statusConfig[call.status];
            const urgent = call.status === 'attention' || call.status === 'missed';
            return (
              <div key={call.id} className="mobile-call-card rounded-2xl p-4 sm:p-5 min-w-0 overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(31,43,39,0.07)' }}>
                <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold text-sm shrink-0" style={{ background: '#F4F1E9', color: '#1F2B27' }}>
                      {call.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#1F2B27' }}>{call.name}</p>
                      <p className="text-xs truncate" style={{ color: '#8A9690' }}>{call.service}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-full font-semibold shrink-0 whitespace-nowrap" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>

                <div className="flex flex-col gap-1 mb-3 min-w-0">
                  <span className="flex items-center gap-1.5 text-xs font-mono min-w-0 overflow-hidden" style={{ color: '#5C6B65' }}>
                    <SmallPhoneIcon color="#9AA39D" />
                    <span className="truncate">{call.phone}</span>
                  </span>
                  {call.email && (
                    <span className="flex items-center gap-1.5 text-xs font-mono min-w-0 overflow-hidden" style={{ color: '#5C6B65' }}>
                      <MailIcon color="#9AA39D" />
                      <span className="truncate">{call.email}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 min-w-0">
                  <span className="font-mono text-xs whitespace-nowrap" style={{ color: '#9AA39D' }}>{call.time}</span>
                  <a
                    href={`tel:${call.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="action-btn mobile-call-action inline-block font-bold px-4 py-1.5 rounded-lg text-xs text-white shrink-0"
                    style={urgent ? { background: '#B4522E' } : { background: '#173F37' }}
                  >
                    {call.status === 'missed' ? 'Callback' : call.status === 'attention' ? 'Call' : 'View'}
                  </a>
                </div>
              </div>
            );
          })}
          {!loading && filtered.length === 0 && (
            <p className="text-center py-14" style={{ color: '#B0AA98' }}>No calls match this search.</p>
          )}
        </div>
      </main>
    </div>
  );
}