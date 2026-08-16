'use client';
import React, { useState } from 'react';
import { Copy, Check, Lock, ChevronDown, ChevronUp, Phone, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = 'https://hvac-backend-production-c861.up.railway.app'; // change to your Railway URL when testing live

type CompanyRow = {
  id: number;
  name: string;
  email: string;
  webhook_url: string;
  created_at: string;
};

type CompanyDashboard = {
  revenue: number;
  answered_calls: number;
  jobs_booked: number;
  callbacks: number;
};

type CompanyLead = {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string | null;
  issue: string;
  status: string;
  appointment_time: string | null;
  estimated_value: number | null;
};

type CompanySettings = {
  company_name: string;
  owner_name: string;
  business_phone: string;
  forward_number: string;
  business_email: string;
  working_hours: string;
  greeting_script: string;
} | null;

type Tab = 'dashboard' | 'calls' | 'settings';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [detailLoading, setDetailLoading] = useState(false);
  const [companyDashboard, setCompanyDashboard] = useState<CompanyDashboard | null>(null);
  const [companyLeads, setCompanyLeads] = useState<CompanyLead[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(null);

  async function loadCompanies(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/companies?secret=${encodeURIComponent(secret)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to load');
      }
      const data: CompanyRow[] = await res.json();
      setCompanies(data);
      setUnlocked(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function copyUrl(id: number, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  async function toggleExpand(companyId: number) {
    if (expandedId === companyId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(companyId);
    setActiveTab('dashboard');
    await loadCompanyDetail(companyId);
  }

  async function loadCompanyDetail(companyId: number) {
    setDetailLoading(true);
    setCompanyDashboard(null);
    setCompanyLeads([]);
    setCompanySettings(null);
    try {
      const [dashRes, leadsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/companies/${companyId}/dashboard?secret=${encodeURIComponent(secret)}`),
        fetch(`${API_BASE}/admin/companies/${companyId}/leads?secret=${encodeURIComponent(secret)}`),
        fetch(`${API_BASE}/admin/companies/${companyId}/settings?secret=${encodeURIComponent(secret)}`),
      ]);
      if (dashRes.ok) setCompanyDashboard(await dashRes.json());
      if (leadsRes.ok) setCompanyLeads(await leadsRes.json());
      if (settingsRes.ok) setCompanySettings(await settingsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-10" style={{ background: '#F3F4F1', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .view-btn { transition: background 0.15s ease; }
        .tab-btn { transition: all 0.15s ease; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: '#D9822B' }}>
          Owner Only
        </p>
        <h1 className="font-display text-3xl font-semibold mb-8" style={{ color: '#171B1F' }}>
          Admin — All Companies
        </h1>

        {!unlocked && (
          <form onSubmit={loadCompanies} className="bg-white rounded-2xl shadow-sm p-8 max-w-md">
            <div className="flex items-center gap-2 mb-4" style={{ color: '#6B7280' }}>
              <Lock size={16} />
              <span className="text-sm">Enter your admin secret to continue</span>
            </div>
            <input
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm mb-4"
              style={{ border: '1px solid #E5E7EB' }}
            />
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#1E3A52' }}
            >
              {loading ? 'Checking…' : 'Unlock'}
            </button>
          </form>
        )}

        {unlocked && (
          <div className="flex flex-col gap-4">
            {companies.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm" style={{ color: '#171B1F' }}>{c.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{c.email}</p>
                    <p className="font-mono text-xs mt-1 truncate max-w-md" style={{ color: '#9CA3AF' }}>{c.webhook_url}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                      onClick={() => copyUrl(c.id, c.webhook_url)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                      style={{ background: copiedId === c.id ? '#3F7A5D' : '#1E3A52' }}
                    >
                      {copiedId === c.id ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === c.id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="view-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: '#F3F4F1', color: '#1E3A52' }}
                    >
                      {expandedId === c.id ? 'Hide' : 'View'}
                      {expandedId === c.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {expandedId === c.id && (
                  <div style={{ borderTop: '1px solid #F0F1EF' }}>
                    {/* Tabs */}
                    <div className="flex items-center gap-2 px-5 pt-4">
                      {(['dashboard', 'calls', 'settings'] as Tab[]).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className="tab-btn font-mono text-xs px-3 py-1.5 rounded-full capitalize"
                          style={activeTab === tab
                            ? { background: '#1E3A52', color: 'white' }
                            : { background: '#F3F4F1', color: '#6B7280' }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="p-5">
                      {detailLoading && <p className="text-sm" style={{ color: '#9CA3AF' }}>Loading…</p>}

                      {!detailLoading && activeTab === 'dashboard' && companyDashboard && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Revenue', value: `$${companyDashboard.revenue.toLocaleString()}`, Icon: TrendingUp },
                            { label: 'Answered Calls', value: companyDashboard.answered_calls, Icon: Phone },
                            { label: 'Jobs Booked', value: companyDashboard.jobs_booked, Icon: CheckCircle2 },
                            { label: 'Callbacks', value: companyDashboard.callbacks, Icon: AlertCircle },
                          ].map((stat) => (
                            <div key={stat.label} className="rounded-xl p-4" style={{ background: '#F3F4F1' }}>
                              <div className="flex items-center gap-1.5 mb-2" style={{ color: '#9CA3AF' }}>
                                <stat.Icon size={13} />
                                <span className="text-xs">{stat.label}</span>
                              </div>
                              <p className="font-display text-xl font-semibold" style={{ color: '#171B1F' }}>{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {!detailLoading && activeTab === 'calls' && (
                        <div className="flex flex-col gap-2">
                          {companyLeads.length === 0 && (
                            <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>No calls yet.</p>
                          )}
                          {companyLeads.map((lead) => (
                            <div key={lead.id} className="flex items-center justify-between rounded-xl p-3" style={{ background: '#F3F4F1' }}>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: '#171B1F' }}>{lead.customer_name}</p>
                                <p className="text-xs truncate" style={{ color: '#6B7280' }}>{lead.issue}</p>
                                <p className="text-xs font-mono mt-0.5" style={{ color: '#9CA3AF' }}>
                                  {lead.phone_number}{lead.email ? ` · ${lead.email}` : ''}
                                </p>
                              </div>
                              <span className="font-mono text-xs px-2.5 py-1 rounded-full shrink-0 ml-3" style={{ background: '#E5F0EA', color: '#3F7A5D' }}>
                                {lead.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!detailLoading && activeTab === 'settings' && (
                        companySettings ? (
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div><span style={{ color: '#9CA3AF' }}>Company name:</span> <span style={{ color: '#171B1F' }}>{companySettings.company_name || '—'}</span></div>
                            <div><span style={{ color: '#9CA3AF' }}>Owner:</span> <span style={{ color: '#171B1F' }}>{companySettings.owner_name || '—'}</span></div>
                            <div><span style={{ color: '#9CA3AF' }}>Business phone:</span> <span style={{ color: '#171B1F' }}>{companySettings.business_phone || '—'}</span></div>
                            <div><span style={{ color: '#9CA3AF' }}>Forward number:</span> <span style={{ color: '#171B1F' }}>{companySettings.forward_number || '—'}</span></div>
                            <div><span style={{ color: '#9CA3AF' }}>Business email:</span> <span style={{ color: '#171B1F' }}>{companySettings.business_email || '—'}</span></div>
                            <div><span style={{ color: '#9CA3AF' }}>Working hours:</span> <span style={{ color: '#171B1F' }}>{companySettings.working_hours || '—'}</span></div>
                            <div className="sm:col-span-2"><span style={{ color: '#9CA3AF' }}>Greeting script:</span> <span style={{ color: '#171B1F' }}>{companySettings.greeting_script || '—'}</span></div>
                          </div>
                        ) : (
                          <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>No settings found.</p>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {companies.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center" style={{ color: '#9CA3AF' }}>
                No companies yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}