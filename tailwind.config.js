/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      colors: {
        space: '#080810',
        card: 'rgba(0,207,255,0.05)',
        neon: '#00CFFF',
        violet: '#7B2FFF',
        rose: '#FF2D78',
        gold: '#FFD700',
        green: '#00FF88',
      }
    },
  },
  plugins: [],
}
