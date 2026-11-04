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

  // Check URL path or query on mount
  useEffect(() => {
    const path = window.location.pathname.toLowerCase()
    const hash = window.location.hash.toLowerCase()
    const search = window.location.search.toLowerCase()

    if (path.endsWith('/admin') || hash === '#/admin' || hash === '#admin' || search.includes('admin')) {
      setCurrentView('admin')
    }

    // Try loading saved retailer session
    const saved = localStorage.getItem('treta_retailer_session')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCurrentRetailer(parsed)
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Update hash when navigating to admin
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
      <Navbar
        currentRetailer={currentRetailer}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenLogin={() => handleOpenLogin('login')}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'admin' ? (
          <AdminPortal onBackToHome={() => handleNavigate('home')} />
        ) : currentView === 'dashboard' && currentRetailer ? (
          <RetailerDashboard
            retailer={currentRetailer}
            onUpdateRetailer={(updated) => {
              setCurrentRetailer(updated)
              localStorage.setItem('treta_retailer_session', JSON.stringify(updated))
            }}
            onAdminClick={() => handleNavigate('admin')}
          />
        ) : (
          <LandingHero
            onLoginClick={() => {
              if (currentRetailer) {
                setCurrentView('dashboard')
              } else {
                handleOpenLogin('login')
              }
            }}
            onRegisterClick={() => handleOpenLogin('register')}
            onServiceClick={(_serviceId) => {
              if (currentRetailer) {
                setCurrentView('dashboard')
              } else {
                handleOpenLogin('login')
              }
            }}
            onAdminClick={() => handleNavigate('admin')}
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
