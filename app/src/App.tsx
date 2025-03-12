import { useState, useEffect } from '@lynx-js/react'
import './App.css'
import { WelcomePage } from './pages/WelcomePage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { HistoryPage } from './pages/HistoryPage.tsx'
import { AuthProvider, useAuth } from './context/AuthContext.tsx'

// Hauptkomponente der App
export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

// Inhalt der App mit Routing-Logik
function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('welcome')

  // Seite basierend auf Authentifizierungsstatus setzen
  useEffect(() => {
    if (loading) return
    
    if (isAuthenticated) {
      setCurrentPage('dashboard')
    } else {
      setCurrentPage('welcome')
    }
  }, [isAuthenticated, loading])

  // Funktion zum Navigieren zwischen Seiten
  const navigateTo = (page: string) => {
    setCurrentPage(page)
  }

  // Rendering der entsprechenden Seite
  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage navigateTo={navigateTo} />
      case 'login':
        return <LoginPage navigateTo={navigateTo} />
      case 'signup':
        return <SignupPage navigateTo={navigateTo} />
      case 'dashboard':
        return <DashboardPage navigateTo={navigateTo} />
      case 'history':
        return <HistoryPage navigateTo={navigateTo} />
      default:
        return <WelcomePage navigateTo={navigateTo} />
    }
  }

  // Wenn die App noch lädt, zeigen wir einen Ladebildschirm
  if (loading) {
    return (
      <view className="LoadingScreen">
        <text className="LoadingText">Lädt...</text>
      </view>
    )
  }

  return (
    <view className="AppContainer">
      {renderPage()}
    </view>
  )
}
