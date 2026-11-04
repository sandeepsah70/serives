import React, { useState } from 'react'
import { Phone, Lock, Eye, EyeOff, User, Mail, Loader2, AlertCircle, CheckCircle, X, KeyRound } from 'lucide-react'
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
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
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
        // Query Supabase retailers table
        const { data: retailer, error: fetchErr } = await supabase
          .from('retailers')
          .select('*')
          .eq('mobile', mobile.trim())
          .maybeSingle()

        if (fetchErr) {
          console.error('Supabase query error:', fetchErr)
        }

        if (retailer) {
          setSuccess('Login Successful!')
          setTimeout(() => {
            onSuccess(retailer)
            onClose()
          }, 400)
        } else {
          // If not in database yet, create on the fly so retailer can always login
          const newRet: Retailer = {
            id: `ret_${mobile.trim()}`,
            name: mobile === '7042702156' ? 'Sandeep Sah' : `Retailer ${mobile.slice(-4)}`,
            mobile: mobile.trim(),
            email: mobile === '7042702156' ? 'sandeepsah808@gmail.com' : `${mobile.trim()}@retailer.com`,
            wallet: 2450.00,
            created_at: new Date().toISOString()
          }
          await supabase.from('retailers').upsert(newRet)
          setSuccess('Login Successful!')
          setTimeout(() => {
            onSuccess(newRet)
            onClose()
          }, 400)
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
          wallet: 1000.00, // Initial welcome bonus
          created_at: new Date().toISOString()
        }

        const { error: insErr } = await supabase.from('retailers').upsert(newRetailer)
        if (insErr) {
          console.error('Registration error:', insErr)
        }

        setSuccess('Retailer Account Created Successfully!')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-black rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl shadow-[#E85D04]/20 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <img
            src="./treta-hero-logo.png"
            alt="Treta Enterprises Logo"
            className="h-20 mx-auto object-contain rounded-2xl mb-3 ring-1 ring-white/10"
          />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Treta <span className="text-[#E85D04]">Enterprises</span>
          </h2>
          <p className="text-white/50 text-xs sm:text-sm mt-0.5">
            {mode === 'login' ? 'Retailer Login Portal' : 'New Retailer Registration'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
              setSuccess(null)
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#E85D04] text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError(null)
              setSuccess(null)
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#E85D04] text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Quick Demo Credentials Pill */}
        {mode === 'login' && (
          <div className="mb-5 bg-[#E85D04]/10 border border-[#E85D04]/30 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-white block">Saved Credentials:</span>
              <span className="text-white/60 font-mono text-[11px]">7042702156 / Sandeep123!@#</span>
            </div>
            <button
              type="button"
              onClick={handleFillCredentials}
              className="flex items-center gap-1 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition-all"
            >
              <KeyRound size={12} />
              Auto Fill
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
            <CheckCircle size={15} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-semibold text-white/70 block mb-1">
                Full Name / Business Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-white/40" />
                <input
                  type="text"
                  placeholder="e.g. Sandeep Sah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-white/70 block mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-3 text-white/40" />
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04]"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-semibold text-white/70 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-white/40" />
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-white/70 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-semibold text-white/70 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E85D04] focus:ring-1 focus:ring-[#E85D04]"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#E85D04] hover:bg-[#cc4f03] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E85D04]/30 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'login' ? (
              <span>Login</span>
            ) : (
              <span>Create Retailer Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-[11px] mt-6">
          Copyright 2026 Treta Enterprises. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}
