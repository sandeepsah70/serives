import React, { useState } from 'react'
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  KeyRound
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import type { Retailer } from '../types'

interface AuthModalProps {
  isOpen: boolean
  initialMode?: 'login' | 'register'
  onClose: () => void
  onSuccess: (retailer: Retailer) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [mobile, setMobile] = useState('7042702156')
  const [password, setPassword] = useState('Sandeep123!@#')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFillCredentials = () => {
    setMobile('7042702156')
    setPassword('Sandeep123!@#')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (mode === 'login') {
      if (!mobile.trim() || !password.trim()) {
        setError('Please enter mobile number and password.')
        return
      }

      setLoading(true)
      try {
        const { data: retailer } = await supabase
          .from('retailers')
          .select('*')
          .eq('mobile', mobile.trim())
          .maybeSingle()

        if (retailer) {
          setSuccess('Login Successful!')
          setTimeout(() => {
            onSuccess(retailer)
            onClose()
          }, 350)
        } else {
          const newRet: Retailer = {
            id: `ret_${mobile.trim()}`,
            name: mobile === '7042702156' ? 'Sandeep Sah' : `Retailer ${mobile.slice(-4)}`,
            mobile: mobile.trim(),
            email: mobile === '7042702156' ? 'sandeepsah808@gmail.com' : `${mobile.trim()}@retailer.com`,
            wallet: 0,
            created_at: new Date().toISOString()
          }
          await supabase.from('retailers').upsert(newRet)
          setSuccess('Login Successful!')
          setTimeout(() => {
            onSuccess(newRet)
            onClose()
          }, 350)
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message)
        else setError('Failed to login. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      // Registration flow
      if (!name.trim() || !mobile.trim() || !password.trim()) {
        setError('Please fill in all required fields.')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      setLoading(true)
      try {
        const newRetailer: Retailer = {
          id: `ret_${mobile.trim()}`,
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || `${mobile.trim()}@retailer.com`,
          wallet: 0,
          created_at: new Date().toISOString()
        }

        await supabase.from('retailers').upsert(newRetailer)
        setSuccess('Retailer Account Created!')
        setTimeout(() => {
          onSuccess(newRetailer)
          onClose()
        }, 500)
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message)
        else setError('Failed to register. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-md animate-in fade-in select-none">
      {mode === 'login' ? (
        /* A. Exact Login Screen Design */
        <div className="relative flex flex-col items-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 p-1.5 text-white/50 hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {/* Orange Glow Effect behind Logo */}
          <div className="relative mb-3 flex flex-col items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-[#F26700]/30 blur-2xl rounded-full pointer-events-none" />
            <img
              src="./treta-hero-logo.png"
              alt="Treta Enterprises Logo"
              className="h-24 w-24 object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(242,103,0,0.35)]"
            />
          </div>

          {/* Treta Enterprises Heading */}
          <h2 className="text-2xl font-bold tracking-tight text-white mb-0.5">
            Treta <span className="text-[#F26700]">Enterprises</span>
          </h2>
          <p className="text-white/50 text-xs sm:text-sm mb-5">Retailer Login Portal</p>

          {/* Login Card (Exact specs: Background #050505, Border #202020, Radius 16px, Width ~352px) */}
          <div className="w-[352px] max-w-full bg-[#050505] border border-[#202020] rounded-[16px] p-6 shadow-2xl text-white">
            {/* Quick Demo Credentials pill */}
            <div className="mb-4 bg-[#140e0a] border border-[#F26700]/30 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-semibold text-white block">Pre-Filled Retailer Login:</span>
                <span className="text-white/60 font-mono text-[10px]">7042702156 / Sandeep123!@#</span>
              </div>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="flex items-center gap-1 bg-[#F26700] hover:bg-[#d95c00] text-white font-semibold px-2 py-1 rounded-lg text-[10px] transition-all"
              >
                <KeyRound size={11} />
                <span>Fill</span>
              </button>
            </div>

            {error && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
                <CheckCircle size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Mobile Number Input (Height: 36px, Background #101010, Border #333333, Radius 7px) */}
              <div>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-2.5 text-white/40" />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full h-[36px] pl-9 pr-3 bg-[#101010] border border-[#333333] rounded-[7px] text-xs text-white placeholder:text-[#777777] focus:outline-none focus:border-[#F26700]"
                    required
                  />
                </div>
              </div>

              {/* Password Input (Height: 36px, Background #101010, Border #333333, Radius 7px) */}
              <div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-2.5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[36px] pl-9 pr-9 bg-[#101010] border border-[#333333] rounded-[7px] text-xs text-white placeholder:text-[#777777] focus:outline-none focus:border-[#F26700]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#777777] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Login Button (300 × 42 px, Orange #F26700, Rounded) */}
              <div className="flex justify-center pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[300px] max-w-full h-[42px] bg-[#F26700] hover:bg-[#d95c00] text-white font-bold text-sm rounded-[10px] flex items-center justify-center gap-2 shadow-lg shadow-[#F26700]/30 transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>

              {/* Links: Forgot Password (Bottom Left) & Create Account (Bottom Right) */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={() => alert('Please contact administrator at 7042702156 to reset password.')}
                  className="text-[#F26700] hover:text-[#ff8526] underline underline-offset-2 transition-colors text-[11px]"
                >
                  Forgot Password
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError(null)
                    setSuccess(null)
                  }}
                  className="text-[#F26700] hover:text-[#ff8526] underline underline-offset-2 font-semibold transition-colors text-[11px]"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>

          {/* Copyright Text below Login Card */}
          <p className="text-center text-[#777777] text-xs mt-6">
            Copyright 2026 Treta Enterprises. All Rights Reserved.
          </p>
        </div>
      ) : (
        /* D. Create Account – Exact Registration Modal (Width: 384px, Background: #050914, Border: #1F2937, Radius: 9px, Padding: 24px) */
        <div className="w-[384px] max-w-full bg-[#050914] border border-[#1F2937] rounded-[9px] p-6 shadow-2xl text-white relative animate-in zoom-in-95">
          {/* Close Button (×) Top Right */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header with User Plus Icon + Create Account Heading */}
          <div className="flex items-center gap-2.5 mb-1">
            <UserPlus className="h-5 w-5 text-[#F26700]" />
            <h3 className="text-lg font-bold text-white tracking-tight">Create Account</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5 leading-normal">
            Register new retailer account to access Treta Services portal
          </p>

          {error && (
            <div className="mb-3.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-3.5 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
              <CheckCircle size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 1. Full Name */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. Sandeep Sah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[36px] pl-9 pr-3 bg-[#101010] border border-[#333333] rounded-[7px] text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#F26700]"
                  required
                />
              </div>
            </div>

            {/* 2. Mobile Number */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full h-[36px] pl-9 pr-3 bg-[#101010] border border-[#333333] rounded-[7px] text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#F26700]"
                  required
                />
              </div>
            </div>

            {/* 3. Email ID */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                Email ID (Optional)
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[36px] pl-9 pr-3 bg-[#101010] border border-[#333333] rounded-[7px] text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#F26700]"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[36px] pl-9 pr-3 bg-[#101010] border border-[#333333] rounded-[7px] text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#F26700]"
                  required
                />
              </div>
            </div>

            {/* 5. Confirm Password */}
            <div>
              <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[36px] pl-9 pr-3 bg-[#101010] border border-[#333333] rounded-[7px] text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-[#F26700]"
                  required
                />
              </div>
            </div>

            {/* Buttons: Cancel (Transparent, Grey) & Create Account (#F26700, Black text) */}
            <div className="flex items-center justify-between pt-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccess(null)
                }}
                className="py-2.5 px-4 bg-transparent text-gray-400 hover:text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-5 bg-[#F26700] hover:bg-[#d95c00] text-black font-bold text-xs rounded-lg shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
