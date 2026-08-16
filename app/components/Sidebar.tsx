'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';

function Lead2Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <circle cx="10" cy="13" r="7" fill="none" stroke="#D4A853" strokeWidth="2" />
      <circle cx="17" cy="13" r="7" fill="none" stroke="#F4EFE6" strokeWidth="2" opacity="0.9" />
    </svg>
  );
}

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
  </svg>
);

export default function Sidebar({ active }: { active: 'dashboard' | 'calls' | 'settings' }) {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  const items = [
    { key: 'dashboard', href: '/dashboard', Icon: HomeIcon, label: 'Dashboard' },
    { key: 'calls', href: '/calls', Icon: PhoneIcon, label: 'Calls' },
    { key: 'settings', href: '/settings', Icon: SettingsIcon, label: 'Settings' },
  ] as const;

  return (
    <>
      {/* spacer keeps page layout stable while the real sidebar overlays and expands */}
      <div style={{ width: 76, flexShrink: 0, height: '100vh' }} aria-hidden="true" />

      <aside
        className="sidebar-panel flex flex-col items-stretch py-7"
        style={{ background: 'linear-gradient(180deg,#0B2B26,#0F332C)' }}
      >
        <style>{`
          .sidebar-panel {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 76px;
            overflow: hidden;
            z-index: 50;
            box-shadow: 0 0 0 rgba(0,0,0,0);
            transition: width 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.32s ease;
          }
          .sidebar-panel:hover,
          .sidebar-panel:focus-within,
          .sidebar-panel.sb-open {
            width: 224px;
            box-shadow: 8px 0 28px -8px rgba(0,0,0,0.45);
          }

          .sb-logo-row { display: flex; align-items: center; gap: 12px; padding-left: 24px; margin-bottom: 36px; }

          .sb-item-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-left: 16px;
            width: 100%;
            transition: background 0.2s ease;
          }
          .sb-item-row:hover { background: rgba(212,168,83,0.08); }

          .sb-item {
            transition: background 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
            flex-shrink: 0;
          }
          .sb-item-row:hover .sb-item,
          .sb-item-row:active .sb-item {
            background: rgba(212,168,83,0.16) !important;
            transform: scale(1.1);
            color: #D4A853 !important;
          }

          .sb-label-inline {
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            transform: translateX(-10px);
            transition: opacity 0.25s ease 0.05s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s;
          }
          .sidebar-panel:hover .sb-label-inline,
          .sidebar-panel:focus-within .sb-label-inline,
          .sidebar-panel.sb-open .sb-label-inline {
            opacity: 1;
            transform: translateX(0);
          }

          .sb-dot { transition: transform 0.2s ease; flex-shrink: 0; margin-left: auto; margin-right: 20px; }
          .sb-item-row:hover .sb-dot { transform: scale(1.4); }

          .sb-logout-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-left: 16px;
            transition: background 0.2s ease;
          }
          .sb-logout-row:hover { background: rgba(212,168,83,0.08); }
          .sb-logout-row:hover .sb-item { transform: scale(1.1); }
        `}</style>

        <div className="sb-logo-row">
          <Lead2Logo size={28} />
        </div>

        <nav className="flex flex-col gap-2.5 flex-1">
          {items.map(({ key, href, Icon, label }) => {
            const isActive = active === key;
            return (
              <a key={key} href={href} title={label} className="sb-item-row">
                <div
                  className="sb-item w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: isActive ? 'rgba(212,168,83,0.16)' : 'transparent',
                    color: isActive ? '#D4A853' : 'rgba(244,239,230,0.45)',
                  }}
                >
                  <Icon />
                </div>
                <span className="sb-label-inline" style={{ color: isActive ? '#D4A853' : 'rgba(244,239,230,0.7)' }}>
                  {label}
                </span>
                {isActive && <div className="sb-dot w-1.5 h-1.5 rounded-full" style={{ background: '#D4A853' }} />}
              </a>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="sb-logout-row bg-transparent border-0 cursor-pointer" title="Log out">
          <div className="sb-item w-11 h-11 rounded-xl flex items-center justify-center" style={{ color: 'rgba(244,239,230,0.35)' }}>
            <LogoutIcon />
          </div>
          <span className="sb-label-inline" style={{ color: 'rgba(244,239,230,0.6)' }}>Log out</span>
        </button>
      </aside>
    </>
  );
}