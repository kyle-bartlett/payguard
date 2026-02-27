import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, ArrowRight, Building2, Zap, Shield } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'For small businesses getting started with compliance.',
    features: [
      'Up to 25 employees',
      'Monthly payroll audits',
      'CSV upload',
      'Basic compliance reports',
      'Email support',
      '10-state coverage',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: 99,
    description: 'For growing teams that need comprehensive coverage.',
    features: [
      'Up to 100 employees',
      'Weekly payroll audits',
      'CSV + API upload',
      'Detailed compliance reports',
      'Violation alerts & notifications',
      'All 50 states + federal',
      'Priority email support',
      'Gusto & ADP integration',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    description: 'For large organizations with complex payroll needs.',
    features: [
      'Unlimited employees',
      'Real-time continuous auditing',
      'Full API access',
      'Custom compliance rules',
      'White-label reporting',
      'All 50 states + federal',
      'Dedicated account manager',
      'Gusto, ADP, QuickBooks, Paycom',
      'SOC 2 compliant',
      'Custom SLA',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

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
              Catch payroll errors before they become lawsuits. Every plan includes a 14-day free trial.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all duration-200 ${
                  plan.popular
                    ? 'bg-white shadow-xl border-2 border-blue-600 scale-105'
                    : 'bg-white shadow-sm border border-slate-200 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/employer/signup"
                  className={`w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom section */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 flex-wrap justify-center text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                14-day free trial
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-slate-400" />
                Cancel anytime
              </div>
            </div>
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
