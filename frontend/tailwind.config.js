/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          50: '#f4f6f8',
          100: '#e3e8ee',
          200: '#c5d1de',
          300: '#9cb0c7',
          400: '#6d8aa9',
          500: '#4c6c8f',
          600: '#395373',
          700: '#2d425c',
          800: '#1e2b3c',
          900: '#0f172a',
          950: '#080d1a',
        },
      },
    },
  },
  plugins: [],
}
