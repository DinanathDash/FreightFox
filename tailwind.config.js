/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Deep blue theme
      },
      keyframes: {
        'bounce-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-25%)' }
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 2px rgba(30, 58, 138, 0.5))'
          },
          '50%': {
            opacity: '0.8',
            filter: 'drop-shadow(0 0 10px rgba(30, 58, 138, 0.8))'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }, animation: {
        'bounce-x': 'bounce-x 1s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      },
      screens: {
        'xs': '480px', // Adding extra small breakpoint
      }
    }
  },
  plugins: [],
}
