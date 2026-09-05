/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Public Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FFF3F0',
          100: '#FFE4DD',
          200: '#FFC9BB',
          300: '#F8B179',
          400: '#F58D6A',
          500: '#F26C4F',
          600: '#E05535',
          700: '#C04428',
          800: '#9A361F',
          900: '#7A2B19',
        },
        surface: {
          app: '#F4F5F7',
          card: '#FFFFFF',
          dark: '#161616',
          border: '#E5E7EB',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          inverse: '#FFFFFF',
        },
        success: {
          50: '#D1FAE5',
          100: '#A7F3D0',
          500: '#10B981',
          600: '#059669',
          700: '#065F46',
        },
        danger: {
          50: '#FEE2E2',
          100: '#FECACA',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        warning: {
          50: '#FEF3C7',
          100: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#92400E',
        },
      },
      borderRadius: {
        'card': '16px',
        'pill': '24px',
        'btn': '8px',
      },
      boxShadow: {
        'card': '0 2px 4px rgba(0,0,0,0.02)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06)',
        'btn': '0 1px 3px rgba(242,108,79,0.2)',
      },
    },
  },
  plugins: [],
}
