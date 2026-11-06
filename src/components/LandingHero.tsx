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
  Users,
  Sparkles
} from 'lucide-react'

interface LandingHeroProps {
  onLoginClick: () => void
  onRegisterClick: () => void
  onServiceClick: (serviceId: string) => void
}

const LANDING_SERVICES = [
  { id: 'pan-new', label: 'PAN Card New', color: '#7C3AED', icon: CreditCard },
  { id: 'pan-corr', label: 'PAN Correction', color: '#9333EA', icon: FileText },
  { id: 'pan-finder', label: 'PAN Finder', color: '#2563EB', icon: Search },
  { id: 'pan-no-dob', label: 'Without Birth Proof PAN', color: '#DC2626', icon: AlertCircle },
  { id: 'dl-rc', label: 'DL / RC Download', color: '#EA580C', icon: FileCheck },
  { id: 'll-exam', label: 'Learning License Exam', color: '#7C3AED', icon: GraduationCap },
  { id: 'tec-cert', label: 'TEC Certificate', color: '#059669', icon: Award }
]

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLoginClick,
  onRegisterClick,
  onServiceClick
}) => {
  return (
    <div className="min-h-screen bg-black text-white relative select-none">
      {/* 1. Hero Section with radial background glow */}
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E85D04]/8 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 text-center relative z-10">
          {/* Badge: India's Trusted Retailer Portal */}
          <div className="inline-flex items-center gap-2 bg-[#E85D04]/10 border border-[#E85D04]/30 rounded-full px-4 py-1.5 text-xs text-[#E85D04] font-semibold mb-8 uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>India's Trusted Retailer Portal</span>
          </div>

          {/* Treta Logo Card */}
          <img
            src="./treta-hero-logo.png"
            alt="Treta Enterprises"
            className="h-32 mx-auto mb-6 rounded-2xl shadow-2xl shadow-[#E85D04]/20"
          />

          {/* Heading: Treta Enterprises */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Treta <span className="text-[#E85D04]">Enterprises</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Government services, utility payments and identity verification — all in one place
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              type="button"
              onClick={onLoginClick}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E85D04]/30 active:scale-95"
            >
              <span>Login to Portal</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-8 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>New Retailer? Register</span>
            </button>
          </div>

          {/* 7 Services Grid */}
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3 max-w-3xl mx-auto mb-16">
            {LANDING_SERVICES.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  onClick={() => onServiceClick(s.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${s.color}33` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] text-white/70 font-medium text-center leading-tight">
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { value: '11+', label: 'Services' },
              { value: 'Fast', label: 'Processing' },
              { value: '24/7', label: 'Support' }
            ].map((e) => (
              <div key={e.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xl font-bold text-[#E85D04]">{e.value}</div>
                <div className="text-xs text-white/50">{e.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Feature Cards */}
      <div className="border-t border-white/10 py-10 px-6">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: Zap, title: 'Instant Results', desc: 'Real-time data processing' },
            { icon: ShieldCheck, title: '100% Secure', desc: 'Encrypted & safe platform' },
            { icon: Users, title: 'Retailer Friendly', desc: 'Easy to use for all retailers' }
          ].map((e) => {
            const Icon = e.icon
            return (
              <div key={e.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Icon className="h-6 w-6 text-[#E85D04] mx-auto mb-2" />
                <div className="font-semibold text-sm mb-1">{e.title}</div>
                <div className="text-xs text-white/50">{e.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Footer */}
      <div className="text-center py-6 border-t border-white/10 text-xs text-white/30">
        Copyright 2026 Treta Enterprises. All Rights Reserved.
      </div>
    </div>
  )
}
