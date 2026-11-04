import React from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'
import { LogOut, ShieldCheck } from 'lucide-react'
import './Auth.css'

interface UserProfileProps {
  user: User
  onSignOut?: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
  const fullName = user.user_metadata?.full_name || 'User'
  const email = user.email || 'No email'
  const initial = (fullName.charAt(0) || email.charAt(0) || 'U').toUpperCase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    if (onSignOut) onSignOut()
  }

  return (
    <div className="auth-wrapper">
      <div className="profile-card">
        <div className="profile-avatar-row">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-info">
            <h3>{fullName}</h3>
            <p>{email}</p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <span>User ID</span>
            <span>{user.id}</span>
          </div>

          <div className="profile-detail-item">
            <span>Authentication Provider</span>
            <span>{user.app_metadata?.provider || 'Email'}</span>
          </div>

          <div className="profile-detail-item">
            <span>Email Status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e' }}>
              <ShieldCheck size={16} /> Verified / Active
            </span>
          </div>

          <div className="profile-detail-item">
            <span>Created At</span>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <button type="button" className="btn-signout" onClick={handleSignOut}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
