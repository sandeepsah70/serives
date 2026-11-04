import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { Navbar } from './components/Navbar'
import { Auth } from './components/Auth'
import { UserProfile } from './components/UserProfile'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'home' | 'auth' | 'profile'>('home')
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser && currentView === 'auth') {
        setCurrentView('profile')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [currentView])

  return (
    <>
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {currentView === 'auth' && (
        <Auth onSuccess={() => setCurrentView('profile')} />
      )}

      {currentView === 'profile' && user && (
        <UserProfile
          user={user}
          onSignOut={() => setCurrentView('home')}
        />
      )}

      {currentView === 'home' && (
        <>
          <section id="center">
            <div className="hero">
              <img src={heroImg} className="base" width="170" height="179" alt="" />
              <img src={reactLogo} className="framework" alt="React logo" />
              <img src={viteLogo} className="vite" alt="Vite logo" />
            </div>
            <div>
              <h1>Services Platform</h1>
              <p>
                Connected to <strong>Supabase</strong> with full Authentication support.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                className="counter"
                onClick={() => setCount((c) => c + 1)}
              >
                Count is {count}
              </button>

              {!user && (
                <button
                  type="button"
                  className="counter"
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none' }}
                  onClick={() => setCurrentView('auth')}
                >
                  Get Started / Login →
                </button>
              )}
            </div>
          </section>

          <div className="ticks"></div>

          <section id="next-steps">
            <div id="docs">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#documentation-icon"></use>
              </svg>
              <h2>Supabase Connected</h2>
              <p>Project: <code>odgyrlkenxufbfdeqsvx</code></p>
              <ul>
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView(user ? 'profile' : 'auth'); }}>
                    {user ? 'View Your Profile & Account' : 'Sign Up or Log In to your account'}
                  </a>
                </li>
                <li>
                  <a href="https://supabase.com/docs" target="_blank" rel="noreferrer">
                    Supabase Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div id="social">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#social-icon"></use>
              </svg>
              <h2>Technologies</h2>
              <p>Modern full-stack setup</p>
              <ul>
                <li>
                  <a href="https://vite.dev/" target="_blank" rel="noreferrer">
                    <img className="logo" src={viteLogo} alt="" />
                    Vite + React
                  </a>
                </li>
                <li>
                  <a href="https://supabase.com" target="_blank" rel="noreferrer">
                    Supabase Auth & Database
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <div className="ticks"></div>
          <section id="spacer"></section>
        </>
      )}
    </>
  )
}

export default App
