/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F26C4F',
          hover: '#E0583B',
          light: '#FEECE8',
        },
        secondaryOrange: '#F8B179',
        appBg: '#F4F5F7',
        surfaceDark: '#161616',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        brand: {
          50: '#FEECE8',
          100: '#FDDAD3',
          200: '#FBB5A7',
          300: '#F8907A',
          400: '#F57B5F',
          500: '#F26C4F',
          600: '#E0583B',
          700: '#C7452A',
          800: '#A33720',
          900: '#822D1B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}
