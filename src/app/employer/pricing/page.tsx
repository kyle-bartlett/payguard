import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Building2 } from 'lucide-react';

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Building2 className="w-4 h-4" />
              For Employers
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Protect your business.{' '}
              <span className="text-blue-600">Stay compliant.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Catch payroll errors before they become lawsuits. Employer pricing is coming soon.
            </p>
          </div>

          {/* Pricing coming soon */}
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Pricing coming soon</h2>
            <p className="mt-3 text-slate-500">
              We are finalizing employer plans. Join the waitlist and we will let you know when they are available.
            </p>
            <Link
              href="/employer/signup"
              className="mt-6 w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
            >
              Join the waitlist
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Integration logos placeholder */}
          <div className="mt-20 text-center">
            <p className="text-sm font-medium text-slate-400 mb-6">Integrates with your payroll provider</p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {['Gusto', 'ADP', 'QuickBooks', 'Paycom', 'Paychex'].map((name) => (
                <div
                  key={name}
                  className="px-6 py-3 bg-white rounded-xl border border-slate-200 text-slate-400 font-semibold text-sm"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
