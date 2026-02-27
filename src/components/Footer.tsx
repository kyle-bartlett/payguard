import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Pay<span className="text-blue-400">Guard</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered payroll analysis that protects workers and helps employers stay compliant.
            </p>
          </div>

          {/* Workers */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">For Workers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/worker/upload" className="hover:text-blue-400 transition-colors">Check My Pay</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link></li>
              <li><span className="text-slate-600">Know Your Rights (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/employer/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/employer/signup" className="hover:text-blue-400 transition-colors">Get Started</Link></li>
              <li><span className="text-slate-600">API Docs (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-600">Privacy Policy</span></li>
              <li><span className="text-slate-600">Terms of Service</span></li>
              <li><span className="text-slate-600">Disclaimer</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} PayGuard. Built by{' '}
            <a href="https://bartlettlabs.io" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener">
              Bartlett Labs
            </a>
          </p>
          <p className="text-xs text-slate-600">
            Not legal advice. Consult an attorney for specific legal matters.
          </p>
        </div>
      </div>
    </footer>
  );
}
