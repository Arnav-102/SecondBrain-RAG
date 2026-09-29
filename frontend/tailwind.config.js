/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        brain: {
          900: '#0a0a0a',
          800: '#1a1a1a',
          accent: '#8a2be2',
          secondary: '#4169e1',
        }
      }
    },
  },
  plugins: [],
}
