import React from 'react'
import type { Retailer } from '../types'
import { LogIn } from 'lucide-react'

interface NavbarProps {
  currentRetailer: Retailer | null
  onNavigate: (view: 'home' | 'dashboard' | 'services' | 'admin') => void
  onOpenLogin: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRetailer,
  onNavigate,
  onOpenLogin
}) => {
  // If retailer is logged in, the dashboard has its own exact layout with sidebar + topbar
  if (currentRetailer) return null

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-black/95 backdrop-blur-md sticky top-0 z-50">
      {/* Brand Logo & Name */}
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => onNavigate('home')}
      >
        <img
          src="./treta-hero-logo.png"
          alt="Treta Enterprises Logo"
          className="h-10 w-10 object-contain rounded-lg shadow-md shadow-[#E85D04]/30"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none'
          }}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base tracking-tight leading-none">
              Treta <span className="text-[#E85D04]">Enterprises</span>
            </span>
          </div>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-semibold block mt-0.5">
            Customer Desk • Retailer Portal
          </span>
        </div>
      </div>

      {/* Login Action Only */}
      <button
        onClick={onOpenLogin}
        className="flex items-center gap-1.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#E85D04]/20 active:scale-95"
      >
        <LogIn size={15} />
        <span>Login to Portal</span>
      </button>
    </nav>
  )
}
