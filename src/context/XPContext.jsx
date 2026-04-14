import { createContext, useContext, useState, useCallback } from 'react'

const XPContext = createContext(null)

export function XPProvider({ children }) {
  const [popups, setPopups] = useState([])

  const showXP = useCallback((amount, x, y) => {
    const id = Date.now() + Math.random()
    const popup = {
      id,
      amount,
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
    }

    setPopups(prev => [...prev, popup])

    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id))
    }, 1100)
  }, [])

  return (
    <XPContext.Provider value={{ showXP, popups }}>
      {children}
    </XPContext.Provider>
  )
}

export function useXP() {
  return useContext(XPContext)
}
