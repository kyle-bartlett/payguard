import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Shield,
  Upload,
  Search,
  FileCheck,
  ArrowRight,
  Users,
  Building2,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  DollarSign,
  Zap,
} from 'lucide-react';

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero min-h-screen flex items-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20 text-white/80 text-sm mb-8">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Protecting workers since 2026</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Are you being{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                underpaid?
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              Upload your pay stub. Our AI analyzes it against federal and state labor laws in{' '}
              <span className="text-white font-semibold">60 seconds</span>. No account needed.
            </p>

            {/* Dual CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/worker/upload"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-900 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Users className="w-5 h-5" />
                I&apos;m a Worker
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/employer/pricing"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur text-white font-bold text-lg rounded-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-200"
              >
                <Building2 className="w-5 h-5" />
                I&apos;m an Employer
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-200/60">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No account required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Your data stays private</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Three steps. <span className="text-blue-600">60 seconds.</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              No legal degree required. Just your pay stub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 h-full">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Pay Stub</h3>
                <p className="text-slate-500 leading-relaxed">
                  Snap a photo or upload an image of your pay stub. We support all standard formats.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 h-full">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">AI Analyzes</h3>
                <p className="text-slate-500 leading-relaxed">
                  Our AI extracts your pay data and checks it against federal and state labor laws.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 h-full">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5">
                  <FileCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Get Results</h3>
                <p className="text-slate-500 leading-relaxed">
                  Instant breakdown of any violations, estimated losses, and next steps you can take.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Check */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              What we <span className="text-blue-600">check for</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
              Comprehensive analysis powered by federal and state labor law databases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <DollarSign className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-1">Minimum Wage</h3>
              <p className="text-sm text-slate-500">Verified against your state&apos;s current minimum wage law.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <Clock className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-1">Overtime Pay</h3>
              <p className="text-sm text-slate-500">Checks for proper 1.5x pay after 40 hours (or daily OT in CA).</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <AlertTriangle className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-1">Tip Credits</h3>
              <p className="text-sm text-slate-500">Ensures tip credit rules are applied correctly in your state.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <Scale className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-bold text-slate-900 mb-1">Break Laws</h3>
              <p className="text-sm text-slate-500">Meal and rest break requirements vary by state. We know them all.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">$9.27B</div>
              <p className="mt-1 text-sm text-blue-200">Stolen from US workers annually</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">2.4M</div>
              <p className="mt-1 text-sm text-blue-200">Workers affected each year</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">50</div>
              <p className="mt-1 text-sm text-blue-200">States + federal laws covered</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">60s</div>
              <p className="mt-1 text-sm text-blue-200">Average analysis time</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Employers CTA */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm mb-4">
                  <Building2 className="w-4 h-4" />
                  For Employers
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  Stay compliant.{' '}
                  <span className="text-blue-400">Avoid lawsuits.</span>
                </h2>
                <p className="mt-4 text-lg text-slate-300 max-w-xl">
                  Audit your entire payroll automatically. Catch errors before your employees — or their attorneys — do.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    'Batch payroll analysis via CSV upload',
                    'Real-time compliance scoring',
                    'Multi-state support',
                    'Integrations with Gusto, ADP, QuickBooks',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <Link
                  href="/employer/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/employer/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
