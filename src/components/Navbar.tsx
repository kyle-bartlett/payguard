'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Pay<span className="text-blue-600">Guard</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/worker/upload" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Check My Pay
            </Link>
            <Link href="/employer/pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              For Employers
            </Link>
            <Link href="/employer/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link
              href="/worker/upload"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Analyze Pay Stub
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/50 glass">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/worker/upload"
              className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setMobileOpen(false)}
            >
              Check My Pay
            </Link>
            <Link
              href="/employer/pricing"
              className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setMobileOpen(false)}
            >
              For Employers
            </Link>
            <Link
              href="/employer/login"
              className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/worker/upload"
              className="block px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg text-center"
              onClick={() => setMobileOpen(false)}
            >
              Analyze Pay Stub
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
