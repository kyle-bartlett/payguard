'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getStateList } from '@/lib/analysis';
import { readApiResponse } from '@/lib/api-response';
import type { EmployerSummary } from '@/lib/pay-stub-store';
import {
  Shield,
  Upload,
  BarChart3,
  AlertTriangle,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  TrendingUp,
  Plug,
  LogOut,
  Loader2,
} from 'lucide-react';

const STATES = getStateList();

function timeAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} hr ago` : `${Math.round(hours / 24)} d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'integrations'>('overview');
  const [signingOut, setSigningOut] = useState(false);
  const [summary, setSummary] = useState<EmployerSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await readApiResponse<EmployerSummary>(await fetch('/api/employer/summary', { cache: 'no-store' })));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'We could not load your dashboard.');
    }
  }, []);

  useEffect(() => {
    // loadSummary only sets state after its fetch resolves; react-hooks 7.1
    // (eslint-config-next 16.4) flags the call anyway.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSummary();
  }, [loadSummary]);

  const handleAnalyze = async () => {
    if (!file || !state) {
      setUploadMessage({ ok: false, text: 'Choose a pay statement and a state.' });
      return;
    }
    setAnalyzing(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('state', state);
      const result = await readApiResponse<{ summary: string; saved?: boolean }>(
        await fetch('/api/analyze', { method: 'POST', body: formData }),
      );
      setUploadMessage({ ok: true, text: result.summary + (result.saved === false ? ' (This result could not be saved to your dashboard.)' : '') });
      setFile(null);
      await loadSummary();
    } catch (err) {
      setUploadMessage({ ok: false, text: err instanceof Error ? err.message : 'Analysis failed.' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/employer/login');
    router.refresh();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-100 pt-20">
        {/* Dashboard Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Employer Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Monitor payroll compliance in real-time</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {summary ? summary.companyName : 'Live'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-50 disabled:opacity-50"
                >
                  {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Sign Out
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'upload', label: 'Check a Pay Statement', icon: Upload },
                { id: 'integrations', label: 'Integrations', icon: Plug },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Compliance Score</span>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">
                    {summary?.complianceScore == null ? '—' : `${summary.complianceScore}%`}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Statements with no flagged issue
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Issues Found</span>
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{summary?.issuesFound ?? '—'}</div>
                  <p className="text-sm text-slate-400 mt-1">Potential violations</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Statements Checked</span>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{summary?.statementsChecked ?? '—'}</div>
                  <p className="text-sm text-slate-400 mt-1">
                    {summary?.recent[0] ? `Last check: ${timeAgo(summary.recent[0].createdAt)}` : 'None yet'}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Clean Checks</span>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{summary?.cleanChecks ?? '—'}</div>
                  <p className="text-sm text-slate-400 mt-1">No issues or notes</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {loadError && <p className="px-6 py-4 text-sm text-red-600">{loadError}</p>}
                  {summary && summary.recent.length === 0 && (
                    <p className="px-6 py-6 text-sm text-slate-500">
                      No statements checked yet. Use the Check a Pay Statement tab to run your first analysis.
                    </p>
                  )}
                  {summary?.recent.map((item) => (
                    <div key={item.id} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex-shrink-0">
                        {item.status === 'clean'
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <AlertTriangle className="w-5 h-5 text-amber-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.employerName ?? 'Pay statement'} ({item.state})</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(item.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'upload' && (
            <div className="max-w-xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Check a Pay Statement</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Upload one PDF, PNG, JPG, or WebP statement (up to 10 MB). Results are saved to your dashboard.
                  </p>
                </div>

                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <span className="text-sm text-slate-600 font-medium">{file ? file.name : 'Choose a pay statement'}</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>

                <label className="block mt-6 text-sm font-medium text-slate-700" htmlFor="state">State</label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select a state</option>
                  {STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                  Analyze & Save
                </button>
                {uploadMessage && (
                  <p className={`text-sm mt-3 ${uploadMessage.ok ? 'text-emerald-700' : 'text-red-600'}`} role="status">
                    {uploadMessage.text}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Plug className="w-6 h-6 text-slate-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Payroll integrations are coming soon</h2>
              <p className="text-sm text-slate-500 mt-2">
                Direct payroll-system connections are not available yet. For now, check statements from the
                Check a Pay Statement tab.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
