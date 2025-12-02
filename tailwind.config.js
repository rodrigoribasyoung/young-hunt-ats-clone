/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#fe5009',
          cyan: '#00bcbc',
          dark: '#0f172a',    // Fundo Principal
          card: '#1e293b',    // Fundo dos Cards
          hover: '#334155',   // Hover state
          border: '#475569',  // Bordas
        }
      }
    },
  },
  plugins: [],
}