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
