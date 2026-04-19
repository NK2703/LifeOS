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
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          cyan: '#00d4ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
          emerald: '#10b981',
          gold: '#f59e0b',
        },
        dark: {
          900: '#060918',
          800: '#0d1117',
          700: '#161b27',
          600: '#1e2433',
          500: '#252d3d',
          400: '#2e3749',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(139,92,246,0.3)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.37)',
        'glow-purple': '0 0 30px rgba(139,92,246,0.4)',
        'glow-cyan': '0 0 30px rgba(0,212,255,0.4)',
        'glow-emerald': '0 0 30px rgba(16,185,129,0.4)',
        'inner-glow': 'inset 0 0 30px rgba(139,92,246,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
        'neo': '4px 4px 10px rgba(0,0,0,0.5), -2px -2px 6px rgba(255,255,255,0.03)',
      },
    },
  },
  plugins: [],
}
