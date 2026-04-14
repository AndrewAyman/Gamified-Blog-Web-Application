/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#07070f',
          surface: '#0d0d1a',
          card: '#111124',
          border: '#1e1e3a',
          cyan: '#00d4ff',
          purple: '#7c3aed',
          green: '#00ff88',
          pink: '#ff006e',
          yellow: '#ffd60a',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'xp-pop': 'xp-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'scan': 'scan 3s linear infinite',
        'border-spin': 'border-spin 4s linear infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'level-up': 'level-up 0.8s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '50%': { boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 60px #00d4ff' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'xp-pop': {
          '0%': { transform: 'scale(0) translateY(0)', opacity: '1' },
          '60%': { transform: 'scale(1.3) translateY(-40px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(-80px)', opacity: '0' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'border-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'level-up': {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.1)', filter: 'brightness(1.5)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grid-cyber': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300d4ff' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(0,212,255,0.1), transparent)',
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00d4ff, 0 0 20px rgba(0,212,255,0.5)',
        'neon-purple': '0 0 10px #7c3aed, 0 0 20px rgba(124,58,237,0.5)',
        'neon-green': '0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.5)',
        'neon-pink': '0 0 10px #ff006e, 0 0 20px rgba(255,0,110,0.5)',
        'card': '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.8), 0 0 15px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
