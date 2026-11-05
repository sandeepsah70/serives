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
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#F26700]/30 selection:text-white font-sans">
      {/* 1. Hero Section with subtle dark brown radial gradient */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 text-center max-w-5xl mx-auto overflow-hidden">
        {/* Subtle dark brown radial gradient in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#3a1a05]/25 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Trusted Retailer Portal Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c140e] border border-[#F26700]/30 text-xs font-semibold text-[#F26700] mb-6 uppercase tracking-wider shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#F26700] animate-pulse" />
          <span>Trusted Retailer Portal</span>
        </div>

        {/* Logo Card with subtle orange shadow */}
        <div className="relative mb-5 flex justify-center">
          <div className="p-3 bg-[#12100e] border border-white/10 rounded-2xl shadow-2xl shadow-[#F26700]/20 inline-block">
            <img
              src="./treta-hero-logo.png"
              alt="Treta Enterprises"
              className="h-28 sm:h-32 object-contain"
            />
          </div>
        </div>

        {/* Main Heading: Treta (White) Enterprises (Orange #F26700) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 leading-tight tracking-tight">
          Treta <span className="text-[#F26700]">Enterprises</span>
        </h1>

        {/* Description */}
        <p className="text-[#a1a1aa] text-base sm:text-lg mb-9 max-w-xl mx-auto leading-relaxed">
          Government services, utility payments and identity verification — all in one place
        </p>

        {/* Main Call To Action Buttons (Exact specs: Login 201x53, Register 264x53, row on desktop, stack on mobile) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Login to Portal Button: 201 × 53 px, Orange Filled #F26700, White Text, Arrow */}
          <button
            type="button"
            onClick={onLoginClick}
            className="w-full sm:w-[201px] h-[53px] bg-[#F26700] hover:bg-[#d95c00] text-white font-bold text-sm sm:text-base rounded-[12px] flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-[#F26700]/30 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F26700]"
          >
            <span>Login to Portal</span>
            <ArrowRight size={18} />
          </button>

          {/* New Retailer? Register Button: 264 × 53 px, Transparent Black, Grey/White Border */}
          <button
            type="button"
            onClick={onRegisterClick}
            className="w-full sm:w-[264px] h-[53px] bg-[#000000]/80 border border-[#404040] hover:border-white/50 text-white font-semibold text-sm sm:text-base rounded-[12px] flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-white/5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <UserPlus size={18} className="text-[#a1a1aa]" />
            <span>New Retailer? Register</span>
          </button>
        </div>

        {/* Section 01 — 7 Services Cards (Horizontal row, total width ~768px, 12px gap, 99x99 px, Dark Charcoal #151312, border 1px #302B28, radius 13px) */}
        <div className="max-w-[768px] mx-auto mb-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 justify-center items-center">
            {LANDING_SERVICES.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.id}
                  onClick={() => onServiceClick(s.id)}
                  className="w-full sm:w-[99px] h-[99px] bg-[#151312] border border-[#302B28] hover:border-[#F26700] hover:bg-[#1a1715] rounded-[13px] flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-200 group active:scale-95"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${s.color}20` }}
                  >
                    <Icon size={17} style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] text-white/90 font-medium text-center leading-tight line-clamp-2">
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 02 — Statistics Cards (3 Cards in one line, 117x70 px each, Background #151312, Radius 12px, Orange #FF6500) */}
        <div className="flex items-center justify-center gap-4 max-w-sm mx-auto mb-16 flex-wrap">
          {[
            { value: '11+', label: 'Services' },
            { value: 'Fast', label: 'Processing' },
            { value: '24/7', label: 'Support' }
          ].map((st) => (
            <div
              key={st.label}
              className="w-[117px] h-[70px] bg-[#151312] border border-[#302B28] rounded-[12px] flex flex-col items-center justify-center text-center p-2"
            >
              <div className="text-xl font-extrabold text-[#FF6500] leading-none mb-1">
                {st.value}
              </div>
              <div className="text-xs text-[#a1a1aa] font-medium leading-none">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 03 — Features (3 Cards in one line, approx 240x106 px each, 24px gap, orange icons, white titles, grey desc, dark bg, thin border) */}
      <section className="border-t border-[#222222] py-14 px-4 sm:px-6 bg-[#000000]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="w-full md:w-[240px] min-h-[106px] bg-[#151312] border border-[#302B28] rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <Zap className="h-6 w-6 text-[#F26700] mb-2" />
            <h3 className="font-bold text-sm text-white mb-0.5">Instant Results</h3>
            <p className="text-xs text-[#777777] leading-tight">Real-time data processing</p>
          </div>

          <div className="w-full md:w-[240px] min-h-[106px] bg-[#151312] border border-[#302B28] rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-[#F26700] mb-2" />
            <h3 className="font-bold text-sm text-white mb-0.5">100% Secure</h3>
            <p className="text-xs text-[#777777] leading-tight">Encrypted & safe platform</p>
          </div>

          <div className="w-full md:w-[240px] min-h-[106px] bg-[#151312] border border-[#302B28] rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <Users className="h-6 w-6 text-[#F26700] mb-2" />
            <h3 className="font-bold text-sm text-white mb-0.5">Retailer Friendly</h3>
            <p className="text-xs text-[#777777] leading-tight">Easy to use for all retailers</p>
          </div>
        </div>
      </section>

      {/* Section 04 — Footer (1px divider, Copyright 2026 Treta Enterprises. All Rights Reserved., 12px, #777777, Black) */}
      <footer className="border-t border-[#222222] py-6 text-center text-xs text-[#777777] bg-[#000000]">
        <p>Copyright 2026 Treta Enterprises. All Rights Reserved.</p>
      </footer>
    </div>
  )
}
