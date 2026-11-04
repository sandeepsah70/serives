import React from 'react'
import type { User } from '@supabase/supabase-js'
import { LogIn } from 'lucide-react'
import './Auth.css'

interface NavbarProps {
  user: User | null
  currentView: 'home' | 'auth' | 'profile'
  onNavigate: (view: 'home' | 'auth' | 'profile') => void
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentView, onNavigate }) => {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <nav className="app-navbar">
      <div className="nav-brand" onClick={() => onNavigate('home')}>
        <span>⚡</span> Services
      </div>

      <div className="nav-links">
        <button
          type="button"
          className={`nav-btn ${currentView === 'home' ? 'nav-btn-active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          Home
        </button>

        {user ? (
          <button
            type="button"
            className="nav-user-pill"
            onClick={() => onNavigate('profile')}
            style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
          >
            <div className="nav-user-avatar">{initial}</div>
            <span>{displayName}</span>
          </button>
        ) : (
          <button
            type="button"
            className="nav-btn nav-btn-primary"
            onClick={() => onNavigate('auth')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogIn size={16} />
            <span>Login / Sign Up</span>
          </button>
        )}
      </div>
    </nav>
  )
}
