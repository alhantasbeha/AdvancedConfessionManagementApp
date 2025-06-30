/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Cairo', 'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', 'system-ui', '-apple-system', 'sans-serif'],
        'arabic': ['Cairo', 'Tajawal', 'system-ui', '-apple-system', 'sans-serif'],
        'arabic-body': ['Tajawal', 'Cairo', 'Almarai', 'system-ui', '-apple-system', 'sans-serif'],
        'arabic-ui': ['IBM Plex Sans Arabic', 'Cairo', 'system-ui', '-apple-system', 'sans-serif'],
        'arabic-headings': ['Cairo', 'Tajawal', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // ألوان مخصصة للوضع النهاري
        light: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          text: '#1e293b',
          'text-secondary': '#475569',
          'text-tertiary': '#64748b',
          border: '#e2e8f0',
          'border-light': '#cbd5e1',
        },
        // ألوان مخصصة محسنة للوضع الليلي
        dark: {
          primary: '#1e293b',
          secondary: '#0f172a',
          tertiary: '#020617',
          text: '#f1f5f9',
          'text-secondary': '#cbd5e1',
          'text-tertiary': '#94a3b8',
          border: '#334155',
          'border-light': '#475569',
          accent: '#60a5fa',
          'accent-hover': '#3b82f6',
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(96, 165, 250, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(96, 165, 250, 0.8)' },
        }
      },
      boxShadow: {
        'light': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'light-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'light-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(96, 165, 250, 0.5)',
        'glow-lg': '0 0 40px rgba(96, 165, 250, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      gradientColorStops: {
        'dark-start': '#0f172a',
        'dark-middle': '#1e293b',
        'dark-end': '#334155',
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.025em' }], // زيادة من 0.75rem
        'sm': ['1rem', { lineHeight: '1.7', letterSpacing: '0.025em' }], // زيادة من 0.875rem
        'base': ['1.125rem', { lineHeight: '1.8', letterSpacing: '0.025em' }], // زيادة من 1rem
        'lg': ['1.25rem', { lineHeight: '1.7', letterSpacing: '0.025em' }], // زيادة من 1.125rem
        'xl': ['1.5rem', { lineHeight: '1.6', letterSpacing: '0.025em' }], // زيادة من 1.25rem
        '2xl': ['1.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }], // زيادة من 1.5rem
        '3xl': ['2.25rem', { lineHeight: '1.4', letterSpacing: '0.025em' }], // زيادة من 1.875rem
        '4xl': ['2.75rem', { lineHeight: '1.3', letterSpacing: '0.025em' }], // زيادة من 2.25rem
      },
      spacing: {
        '18': '4.5rem', // إضافة مسافات جديدة
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      }
    },
  },
  plugins: [],
};