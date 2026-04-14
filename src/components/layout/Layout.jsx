import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import XPPopupLayer from '../ui/XPPopupLayer'

export default function Layout() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-cyber-bg">
      {/* Scanline overlay */}
      <div className="scanline pointer-events-none" />

      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <XPPopupLayer />
    </div>
  )
}
