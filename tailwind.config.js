/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          '50': '#f3f4f6', 
          '100': '#e7e8ed', 
          '200': '#c3c6d1', 
          '300': '#9ea3b5', 
          '400': '#565e7e', 
          '500': '#0d1947', 
          '600': '#0c1740', 
          '700': '#0a1335', 
          '800': '#080f2b', 
          '900': '#060c23'
        },
        blue: {
          '50':  '#f6f9fb',
          '100': '#e3f0fd',
          '200': '#c5d9fb',
          '300': '#9db5f3',
          '400': '#7a8deb',
          '500': '#6369e4',
          '600': '#514cd6',
          '700': '#3e39b7',
          '800': '#2b2789',
          '900': '#181956',
        }
      }
    }
  },
  plugins: [],
}

