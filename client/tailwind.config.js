/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        coral: {
          DEFAULT: '#ff6b4a',
          50: '#fff7f5',
          100: '#ffede8',
          200: '#ffdcd3',
          300: '#ffc1b2',
          400: '#ff9680',
          500: '#ff6b4a',
          600: '#e85635',
          700: '#c44122',
          800: '#a1351b',
          900: '#842f1b',
          light: '#ff866b',
          dark: '#e85635',
          soft: '#fff0eb',
          glow: 'rgba(255,107,74,0.25)',
        },
        peach: {
          DEFAULT: '#ffd7c7',
          light: '#fff2ec',
          card: '#fff5ef',
          dark: '#3d251d',
        },
        warm: {
          50: '#faf8f5',
          100: '#f5f2ed',
          200: '#ebe6df',
          300: '#dcd5cc',
          400: '#b5aba0',
          500: '#8e8378',
          600: '#6e645a',
          700: '#4f4740',
          800: '#2c2825',
          900: '#1a1816',
        },
        surface: {
          900: '#151413',
          800: '#1e1c1b',
          700: '#282624',
          600: '#34312e',
          500: '#45413d',
        },
        accent: {
          DEFAULT: '#ff6b4a',
          light: '#ff866b',
          dark: '#e85635',
          glow: 'rgba(255,107,74,0.25)',
        },
        violet: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
        },
        text: {
          primary: '#1e1c1b',
          secondary: '#78736e',
          muted: '#a8a29e',
          dim: '#c5bfb8',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease both',
        'slide-up': 'slideUp 0.3s ease both',
        'slide-down': 'slideDown 0.3s ease both',
        'scale-in': 'scaleIn 0.15s ease both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'typing-blink': 'typingBlink 1.2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'msg-in': 'msgIn 0.2s ease both',
        'ctx-in': 'ctxIn 0.15s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.93) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.15)' },
        },
        typingBlink: {
          '0%, 80%, 100%': { opacity: '0.2' },
          '40%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        msgIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ctxIn: {
          '0%': { opacity: '0', transform: 'scale(0.93) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}