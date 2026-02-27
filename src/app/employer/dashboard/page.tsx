'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Shield,
  Upload,
  BarChart3,
  AlertTriangle,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Plug,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'integrations'>('overview');

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
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Demo Mode
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'upload', label: 'Upload Payroll', icon: Upload },
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
                  <div className="text-3xl font-bold text-slate-900">94%</div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +2% from last month
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Issues Found</span>
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">3</div>
                  <p className="text-sm text-slate-400 mt-1">Across 2 employees</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Employees Checked</span>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">47</div>
                  <p className="text-sm text-slate-400 mt-1">Last audit: 2 hours ago</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500">Clean Checks</span>
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900">44</div>
                  <p className="text-sm text-slate-400 mt-1">93.6% pass rate</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    View All
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { status: 'clean', name: 'Sarah Johnson', time: '2 hours ago', detail: 'Weekly payroll — no issues' },
                    { status: 'issue', name: 'Mike Thompson', time: '2 hours ago', detail: 'Overtime rate below 1.5x' },
                    { status: 'clean', name: 'Lisa Chen', time: '2 hours ago', detail: 'Weekly payroll — no issues' },
                    { status: 'issue', name: 'James Wilson', time: '3 hours ago', detail: 'Missing meal break documentation' },
                    { status: 'clean', name: 'Emily Davis', time: '3 hours ago', detail: 'Weekly payroll — no issues' },
                  ].map((item, i) => (
                    <div key={i} className="px-6 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex-shrink-0">
                        {item.status === 'clean'
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <AlertTriangle className="w-5 h-5 text-amber-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time}
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
                  <h2 className="text-xl font-bold text-slate-900">Upload Payroll Data</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Upload a CSV or Excel file with your payroll data for bulk analysis.
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 font-medium">
                    Drop CSV or Excel file here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports .csv, .xlsx — up to 50MB
                  </p>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Required Columns:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Employee Name', 'Hours Worked', 'Hourly Rate', 'Gross Pay', 'State', 'OT Hours', 'OT Rate'].map((col) => (
                      <span key={col} className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed">
                  Upload & Analyze
                </button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Bulk analysis coming soon
                </p>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                {[
                  { name: 'Gusto', status: 'available', description: 'Sync employee data and payroll automatically' },
                  { name: 'ADP', status: 'available', description: 'Connect your ADP Workforce Now account' },
                  { name: 'QuickBooks', status: 'coming', description: 'QuickBooks Payroll integration' },
                  { name: 'Paycom', status: 'coming', description: 'Paycom HR and payroll sync' },
                  { name: 'Paychex', status: 'coming', description: 'Paychex Flex integration' },
                ].map((integration) => (
                  <div key={integration.name} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Plug className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{integration.name}</h3>
                      <p className="text-sm text-slate-500">{integration.description}</p>
                    </div>
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        integration.status === 'available'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={integration.status === 'coming'}
                    >
                      {integration.status === 'available' ? 'Connect' : 'Coming Soon'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
