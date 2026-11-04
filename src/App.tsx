import { useState, useEffect } from 'react'
import type { Retailer } from './types'
import { Navbar } from './components/Navbar'
import { LandingHero } from './components/LandingHero'
import { AuthModal } from './components/AuthModal'
import { RetailerDashboard } from './components/RetailerDashboard'
import { AdminPortal } from './components/AdminPortal'

export function App() {
  const [currentRetailer, setCurrentRetailer] = useState<Retailer | null>(null)
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'services' | 'admin'>('home')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login')

  // Check URL path, hash, or query on mount
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase()
      const hash = window.location.hash.toLowerCase()
      const search = window.location.search.toLowerCase()

      // Supports both /admin and /amin as requested!
      if (
        path.endsWith('/admin') ||
        path.endsWith('/amin') ||
        hash.includes('admin') ||
        hash.includes('amin') ||
        search.includes('admin') ||
        search.includes('amin')
      ) {
        setCurrentView('admin')
        return
      }

      // Check saved retailer session
      const saved = localStorage.getItem('treta_retailer_session')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setCurrentRetailer(parsed)
          setCurrentView('dashboard')
        } catch (e) {
          console.error(e)
        }
      }
    }

    checkRoute()
    window.addEventListener('hashchange', checkRoute)
    return () => window.removeEventListener('hashchange', checkRoute)
  }, [])

  const handleNavigate = (view: 'home' | 'dashboard' | 'services' | 'admin') => {
    setCurrentView(view)
    if (view === 'admin') {
      window.history.pushState({}, '', '#/admin')
    } else {
      window.history.pushState({}, '', window.location.pathname)
    }
  }

  const handleLoginSuccess = (retailer: Retailer) => {
    setCurrentRetailer(retailer)
    localStorage.setItem('treta_retailer_session', JSON.stringify(retailer))
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setCurrentRetailer(null)
    localStorage.removeItem('treta_retailer_session')
    setCurrentView('home')
  }

  const handleOpenLogin = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Navbar only shown on public landing pages when not in admin and not logged in */}
      {currentView !== 'admin' && !currentRetailer && (
        <Navbar
          currentRetailer={currentRetailer}
          onNavigate={handleNavigate}
          onOpenLogin={() => handleOpenLogin('login')}
        />
      )}

      <main className="flex-1">
        {currentView === 'admin' ? (
          <AdminPortal onBackToHome={() => handleNavigate('home')} />
        ) : currentRetailer ? (
          /* EXACT RETAILER DASHBOARD AS IN SCREENSHOT */
          <RetailerDashboard
            retailer={currentRetailer}
            onUpdateRetailer={(updated) => {
              setCurrentRetailer(updated)
              localStorage.setItem('treta_retailer_session', JSON.stringify(updated))
            }}
            onLogout={handleLogout}
          />
        ) : (
          <LandingHero
            onLoginClick={() => handleOpenLogin('login')}
            onRegisterClick={() => handleOpenLogin('register')}
            onServiceClick={(_serviceId) => handleOpenLogin('login')}
          />
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  )
}

export default App
