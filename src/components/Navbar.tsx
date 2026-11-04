import React from 'react'
import type { Retailer } from '../types'
import { LogIn, Shield, Wallet, LogOut, LayoutDashboard, Home, Layers } from 'lucide-react'

interface NavbarProps {
  currentRetailer: Retailer | null
  currentView: 'home' | 'dashboard' | 'services' | 'admin'
  onNavigate: (view: 'home' | 'dashboard' | 'services' | 'admin') => void
  onOpenLogin: () => void
  onLogout: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRetailer,
  currentView,
  onNavigate,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-black/90 backdrop-blur-md sticky top-0 z-50">
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
            // fallback if logo missing
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

      {/* Center Links */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium">
        <button
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentView === 'home'
              ? 'bg-[#E85D04] text-white font-semibold shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Home size={14} />
          Home
        </button>

        <button
          onClick={() => onNavigate('services')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentView === 'services'
              ? 'bg-[#E85D04] text-white font-semibold shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Layers size={14} />
          Services
        </button>

        {currentRetailer && (
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'dashboard'
                ? 'bg-[#E85D04] text-white font-semibold shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
        )}

        <button
          onClick={() => onNavigate('admin')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentView === 'admin'
              ? 'bg-[#E85D04] text-white font-semibold shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Shield size={14} className="text-amber-400" />
          Admin Portal
        </button>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        {currentRetailer ? (
          <div className="flex items-center gap-3">
            {/* Wallet Pill */}
            <div className="flex items-center gap-2 bg-[#E85D04]/10 border border-[#E85D04]/30 px-3 py-1.5 rounded-xl">
              <Wallet size={15} className="text-[#E85D04]" />
              <div className="text-left">
                <span className="text-[10px] text-white/50 block leading-tight">Wallet</span>
                <span className="text-xs font-bold text-white">
                  ₹{Number(currentRetailer.wallet).toFixed(2)}
                </span>
              </div>
            </div>

            {/* User Pill */}
            <div
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-[#E85D04] text-white text-xs font-bold flex items-center justify-center">
                {currentRetailer.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                {currentRetailer.name}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('admin')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <Shield size={14} className="text-amber-400" />
              Admin
            </button>

            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 bg-[#E85D04] hover:bg-[#cc4f03] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-[#E85D04]/20"
            >
              <LogIn size={15} />
              Login to Portal
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
