import React from 'react'
import {
  CreditCard,
  FileText,
  Search,
  AlertCircle,
  FileCheck,
  GraduationCap,
  Award,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react'

interface LandingHeroProps {
  onLoginClick: () => void
  onRegisterClick: () => void
  onServiceClick: (serviceId: string) => void
}

const CORE_SERVICES = [
  { id: 'pan-new', label: 'PAN Card New', color: '#7C3AED', icon: CreditCard },
  { id: 'pan-corr', label: 'PAN Card Correction', color: '#9333EA', icon: FileText },
  { id: 'pan-finder', label: 'PAN Finder', color: '#2563EB', icon: Search },
  { id: 'pan-no-dob', label: 'Without Birth Proof PAN', color: '#DC2626', icon: AlertCircle },
  { id: 'dl-download', label: 'DL PDF Download', color: '#EA580C', icon: FileCheck },
  { id: 'll-exam', label: 'Learning License Exam', color: '#7C3AED', icon: GraduationCap },
  { id: 'tec-cert', label: 'TEC Certificate', color: '#059669', icon: Award }
]

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLoginClick,
  onRegisterClick,
  onServiceClick
}) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E85D04]/30 selection:text-white">
      {/* Hero Section */}
      <section className="pt-16 pb-16 px-4 sm:px-6 text-center max-w-5xl mx-auto">
        {/* Hero Image */}
        <div className="relative mb-6">
          <img
            src="./treta-hero-logo.png"
            alt="Treta Enterprises"
            className="h-28 sm:h-32 mx-auto rounded-2xl shadow-2xl shadow-[#E85D04]/30 object-contain ring-1 ring-white/10"
          />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
          Treta <span className="text-[#E85D04]">Enterprises</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Government services, utility payments and identity verification — all in one place
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <button
            onClick={onLoginClick}
            className="w-full sm:w-auto px-9 py-3.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E85D04]/30 active:scale-95"
          >
            <span>Login to Portal</span>
            <ArrowRight size={17} />
          </button>

          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-8 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 active:scale-95"
          >
            <UserPlus size={17} />
            <span>New Retailer? Register</span>
          </button>
        </div>

        {/* 7 Core Services Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 max-w-4xl mx-auto mb-14">
          {CORE_SERVICES.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.id}
                onClick={() => onServiceClick(s.id)}
                className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#E85D04]/50 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${s.color}25` }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <span className="text-[11px] text-white/80 font-medium text-center leading-snug">
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* 3 Stats Cards */}
        <div className="grid grid-cols-3 gap-3.5 max-w-md mx-auto">
          {[
            { value: '10+', label: 'Services' },
            { value: 'Fast', label: 'Processing' },
            { value: '24/7', label: 'Support' }
          ].map((st) => (
            <div
              key={st.label}
              className="text-center p-3.5 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-2xl font-extrabold text-[#E85D04] tracking-tight">
                {st.value}
              </div>
              <div className="text-xs text-white/50 font-medium mt-0.5">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="border-t border-white/10 py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5 text-center">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <Zap className="h-8 w-8 text-[#E85D04] mx-auto mb-3" />
            <h3 className="font-bold text-base text-white mb-1">Instant Results</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Real-time data processing and immediate soft-copy PDF generation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck className="h-8 w-8 text-[#E85D04] mx-auto mb-3" />
            <h3 className="font-bold text-base text-white mb-1">100% Secure</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Fully encrypted & authenticated platform powered by Supabase Cloud.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <Users className="h-8 w-8 text-[#E85D04] mx-auto mb-3" />
            <h3 className="font-bold text-base text-white mb-1">Retailer Friendly</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Single-wallet balance system with instant debit and order tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/10 text-xs text-white/40">
        <p>Copyright 2026 Treta Enterprises. All Rights Reserved.</p>
        <p className="mt-1 text-[11px] text-white/20">
          India's Premier Digital Service Retailer Infrastructure Desk
        </p>
      </footer>
    </div>
  )
}
