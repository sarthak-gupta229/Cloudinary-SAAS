'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  ImageIcon,
  SunIcon,
  MoonIcon,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const sidebarItems = [
  { href: '/home', icon: LayoutDashboardIcon, label: 'Home Page' },
  { href: '/social-share', icon: Share2Icon, label: 'Social Share' },
  { href: '/video-upload', icon: UploadIcon, label: 'Video Upload' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  // Load saved theme or fall back to system preference
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initial = saved ?? preferred;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/sign-in');
    } catch {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={sidebarOpen}
        onChange={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <header className="w-full bg-base-200">
          <div className="navbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="sidebar-drawer"
                className="btn btn-square btn-ghost drawer-button"
              >
                <MenuIcon />
              </label>
            </div>
            <div className="flex-1">
              <Link href="/" onClick={handleLogoClick}>
                <div className="btn btn-ghost normal-case text-2xl font-bold tracking-tight cursor-pointer">
                  Cloudinary Showcase
                </div>
              </Link>
            </div>
            <div className="flex-none flex items-center gap-3">
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={
                  theme === 'light'
                    ? 'Switch to dark mode'
                    : 'Switch to light mode'
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: '1.5px solid',
                  borderColor: theme === 'light' ? '#e2e8f0' : '#374151',
                  background: theme === 'light' ? '#f8fafc' : '#1f2937',
                  color: theme === 'light' ? '#374151' : '#e5e7eb',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  whiteSpace: 'nowrap',
                }}
              >
                {theme === 'light' ? (
                  <>
                    <MoonIcon style={{ width: '15px', height: '15px' }} />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <SunIcon
                      style={{
                        width: '15px',
                        height: '15px',
                        color: '#f59e0b',
                      }}
                    />
                    <span>Light</span>
                  </>
                )}
              </button>
              {user && (
                <>
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img
                        src={user.imageUrl}
                        alt={
                          user.username || user.emailAddresses[0].emailAddress
                        }
                      />
                    </div>
                  </div>
                  <span className="text-sm truncate max-w-xs lg:max-w-md">
                    {user.username || user.emailAddresses[0].emailAddress}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-ghost btn-circle"
                  >
                    <LogOutIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-grow bg-base-100 text-base-content">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-8">
            {children}
          </div>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px', fontWeight: 500 },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </div>
      <div className="drawer-side">
        <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
        <aside className="bg-base-200 w-64 h-full flex flex-col">
          <div className="flex items-center justify-center py-4">
            <ImageIcon className="w-10 h-10 text-primary" />
          </div>
          <ul className="menu p-4 w-full text-base-content flex-grow">
            {sidebarItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link
                  href={item.href}
                  className={`flex items-center space-x-4 px-4 py-2 rounded-lg ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'hover:bg-base-300'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          {user && (
            <div className="p-4">
              <button
                onClick={handleSignOut}
                className="btn btn-outline btn-error w-full"
              >
                <LogOutIcon className="mr-2 h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
