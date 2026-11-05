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
    <header className="h-[76px] bg-[#000000] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Left: Logo + Brand Name + PORTAL Label */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => onNavigate('home')}
      >
        <img
          src="./treta-hero-logo.png"
          alt="Treta Enterprises"
          className="h-11 w-11 object-contain rounded-xl shadow-md shadow-[#F26700]/25"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none'
          }}
        />
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-tight">
              Treta <span className="text-[#F26700]">Enterprises</span>
            </span>
          </div>
          <span className="text-[10px] text-white/50 tracking-widest font-semibold uppercase leading-none mt-0.5">
            PORTAL
          </span>
        </div>
      </div>

      {/* Right: Login (70x38) + Create Account (139x37) Buttons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Login Button: Black + Orange Border #F26700, 70 x 38 px */}
        <button
          type="button"
          onClick={onOpenLogin}
          className="w-[70px] h-[38px] bg-black border border-[#F26700] text-white hover:text-[#F26700] hover:bg-[#F26700]/10 hover:shadow-md hover:shadow-[#F26700]/20 text-xs sm:text-sm font-semibold rounded-[11px] flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F26700] active:scale-95"
        >
          Login
        </button>

        {/* Create Account Button: Orange Filled #F26700, White text, 139 x 37 px */}
        <button
          type="button"
          onClick={onOpenRegister}
          className="w-[139px] h-[37px] bg-[#F26700] hover:bg-[#d95c00] text-white text-xs sm:text-sm font-semibold rounded-[11px] flex items-center justify-center shadow-lg shadow-[#F26700]/30 hover:brightness-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F26700] active:scale-95"
        >
          Create Account
        </button>
      </div>
    </header>
  )
}
