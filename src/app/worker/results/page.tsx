'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  DollarSign,
  Clock,
  Scale,
  FileText,
  ArrowLeft,
  Upload,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Violation {
  type: string;
  severity: string;
  description: string;
  estimatedLoss: number;
  lawReference: string;
}

interface AnalysisData {
  status: string;
  violations: Violation[];
  totalEstimatedLoss: number;
  summary: string;
  state: string;
  stateName: string;
  extractedData?: Record<string, unknown>;
}

const violationIcons: Record<string, React.ReactNode> = {
  minimum_wage: <DollarSign className="w-5 h-5" />,
  overtime: <Clock className="w-5 h-5" />,
  tip_credit: <DollarSign className="w-5 h-5" />,
  meal_break: <Scale className="w-5 h-5" />,
  rest_break: <Scale className="w-5 h-5" />,
};

const violationLabels: Record<string, string> = {
  minimum_wage: 'Minimum Wage',
  overtime: 'Overtime Pay',
  tip_credit: 'Tip Credit',
  meal_break: 'Meal Break',
  rest_break: 'Rest Break',
};

const severityColors: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
  },
  violation: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  },
};

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [expandedViolation, setExpandedViolation] = useState<number | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('payguard_results');
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch {
        router.push('/worker/upload');
      }
    } else {
      router.push('/worker/upload');
    }
  }, [router]);

  if (!results) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </main>
      </>
    );
  }

  const isClean = results.status === 'clean';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back button */}
          <button
            onClick={() => router.push('/worker/upload')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze another pay stub
          </button>

          {/* Status Banner */}
          <div className={`rounded-2xl p-6 sm:p-8 mb-6 ${isClean
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isClean ? 'bg-emerald-400/30' : 'bg-red-400/30'}`}>
                {isClean
                  ? <CheckCircle2 className="w-8 h-8 text-white" />
                  : <AlertTriangle className="w-8 h-8 text-white" />
                }
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {isClean ? 'Your Pay Looks Correct' : 'Potential Issues Found'}
                </h1>
                <p className="mt-2 text-white/80 leading-relaxed">
                  {results.summary}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  <Scale className="w-3.5 h-3.5" />
                  {results.stateName} labor law
                </div>
              </div>
            </div>

            {!isClean && results.totalEstimatedLoss > 0 && (
              <div className="mt-6 p-4 bg-white/10 backdrop-blur rounded-xl">
                <p className="text-sm text-white/70 mb-1">Estimated Underpayment</p>
                <p className="text-4xl font-bold text-white">
                  ${results.totalEstimatedLoss.toFixed(2)}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  *This is an estimate based on the data we extracted. Actual amounts may vary.
                </p>
              </div>
            )}
          </div>

          {/* Violations List */}
          {!isClean && results.violations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  Issues Found ({results.violations.length})
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {results.violations.map((v, i) => {
                  const colors = severityColors[v.severity] || severityColors.warning;
                  const isExpanded = expandedViolation === i;
                  return (
                    <div key={i} className={`${colors.bg} transition-colors`}>
                      <button
                        onClick={() => setExpandedViolation(isExpanded ? null : i)}
                        className="w-full px-6 py-4 flex items-start gap-3 text-left"
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {colors.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-bold ${colors.text}`}>
                              {violationLabels[v.type] || v.type}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${colors.border} ${colors.text}`}>
                              {v.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className={`mt-1 text-sm ${colors.text} opacity-80 line-clamp-2`}>
                            {v.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {v.estimatedLoss > 0 && (
                            <span className={`text-sm font-bold ${colors.text}`}>
                              -${v.estimatedLoss.toFixed(2)}
                            </span>
                          )}
                          {isExpanded
                            ? <ChevronUp className={`w-4 h-4 ${colors.text}`} />
                            : <ChevronDown className={`w-4 h-4 ${colors.text}`} />
                          }
                        </div>
                      </button>
                      {isExpanded && (
                        <div className={`px-6 pb-4 border-t ${colors.border}`}>
                          <div className="pt-3 space-y-3">
                            <p className={`text-sm ${colors.text}`}>{v.description}</p>
                            {v.lawReference && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <FileText className="w-3.5 h-3.5" />
                                <span>Reference: {v.lawReference}</span>
                              </div>
                            )}
                            {v.estimatedLoss > 0 && (
                              <div className="p-3 bg-white/60 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Estimated Loss</p>
                                <p className={`text-xl font-bold ${colors.text}`}>
                                  ${v.estimatedLoss.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extracted Data */}
          {results.extractedData && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Extracted Pay Data</h2>
                <p className="text-xs text-slate-400 mt-1">Data our AI extracted from your pay stub</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(results.extractedData).map(([key, value]) => {
                    if (value === null || value === undefined || key === 'deductions') return null;
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (s) => s.toUpperCase());
                    const displayValue = typeof value === 'number'
                      ? (key.includes('Rate') || key.includes('Pay') || key.includes('tips') || key.includes('gross') || key.includes('net'))
                        ? `$${value.toFixed(2)}`
                        : value.toString()
                      : String(value);
                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-slate-900">{displayValue}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isClean && (
              <>
                <button
                  className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm opacity-90 cursor-not-allowed"
                  disabled
                >
                  <FileText className="w-5 h-5" />
                  Generate Demand Letter
                  <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full ml-2">Coming Soon</span>
                </button>
                <button
                  className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm opacity-90 cursor-not-allowed"
                  disabled
                >
                  <ExternalLink className="w-5 h-5" />
                  Talk to an Attorney
                  <span className="text-xs bg-emerald-500 px-2 py-0.5 rounded-full ml-2">Coming Soon</span>
                </button>
              </>
            )}
            <Link
              href="/worker/upload"
              className="w-full py-3.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Analyze Another Pay Stub
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Important Disclaimer</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  PayGuard provides informational analysis only. This is not legal advice. Labor law
                  violations should be reviewed by a qualified attorney. Results are based on OCR
                  extraction and may not be 100% accurate. Always verify with your actual pay records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
