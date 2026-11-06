import React from 'react'
import type { Retailer } from '../types'

interface NavbarProps {
  currentRetailer: Retailer | null
  onNavigate: (view: 'home' | 'dashboard' | 'services' | 'admin') => void
  onOpenLogin: () => void
  onOpenRegister: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRetailer,
  onNavigate,
  onOpenLogin,
  onOpenRegister
}) => {
  // When logged in as retailer, the dashboard has its own top header
  if (currentRetailer) return null

  return (
    <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-black/95 backdrop-blur-md select-none">
      {/* Left: Logo + Brand Name */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => onNavigate('home')}
      >
        <img
          src="./treta-hero-logo.png"
          alt="Treta Enterprises"
          className="h-10 w-10 object-contain rounded-lg"
        />
        <div>
          <span className="font-bold text-white text-sm block">Treta Enterprises</span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest block">Portal</span>
        </div>
      </div>

      {/* Right: Login & Create Account */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-4 py-2 text-sm font-semibold border border-[#E85D04]/50 text-[#E85D04] rounded-lg hover:bg-[#E85D04]/10 transition-colors"
        >
          Login
        </button>
        <button
          type="button"
          onClick={onOpenRegister}
          className="px-4 py-2 text-sm font-bold bg-[#E85D04] text-white rounded-lg hover:bg-[#cc4f03] transition-colors shadow-sm"
        >
          Create Account
        </button>
      </div>
    </nav>
  )
}
