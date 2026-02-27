'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Upload,
  Camera,
  FileImage,
  Loader2,
  AlertCircle,
  ChevronDown,
  X,
  Shield,
  Eye,
} from 'lucide-react';

const STATES = [
  { code: 'CA', name: 'California' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'IL', name: 'Illinois' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'NY', name: 'New York' },
  { code: 'OH', name: 'Ohio' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'TX', name: 'Texas' },
  { code: 'WA', name: 'Washington' },
];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/') && f.type !== 'application/pdf') {
      setError('Please upload an image (JPG, PNG) or PDF file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.');
      return;
    }
    setFile(f);
    setError(null);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a pay stub image first.');
      return;
    }
    if (!state) {
      setError('Please select your state.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('state', state);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      // Store results and navigate
      sessionStorage.setItem('payguard_results', JSON.stringify(data));
      router.push('/worker/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Check Your Pay
            </h1>
            <p className="mt-3 text-slate-500 max-w-md mx-auto">
              Upload your pay stub and select your state. We&apos;ll analyze it in seconds.
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Upload Area */}
            <div className="p-6 sm:p-8">
              {!file ? (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors cursor-pointer
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-700 mb-1">
                    Drop your pay stub here
                  </p>
                  <p className="text-sm text-slate-400 mb-6">
                    or click to browse • JPG, PNG, PDF up to 10MB
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      <FileImage className="w-4 h-4" />
                      Choose File
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm"
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="relative">
                  {preview ? (
                    <div className="relative rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={preview}
                        alt="Pay stub preview"
                        className="w-full max-h-64 object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          {file.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <FileImage className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">{file.name}</p>
                        <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>

            {/* State Selector */}
            <div className="px-6 sm:px-8 pb-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Your State
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Choose your state...</option>
                  {STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Labor laws vary by state — this ensures accurate analysis
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 sm:mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action */}
            <div className="p-6 sm:p-8">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !file || !state}
                className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Your Pay Stub...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Analyze My Pay
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Your pay stub is processed securely and never shared with third parties.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
