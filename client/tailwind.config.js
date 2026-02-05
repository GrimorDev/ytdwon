/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Nowa paleta kolorów Vipile
        primary: {
          50: '#f3f1f9',
          100: '#e4e0f0',
          200: '#cdc5e3',
          300: '#afa2d1',
          400: '#9181bd',
          500: '#7c6aab',
          600: '#635985', // główny akcent
          700: '#554c70',
          800: '#443C68', // ciemniejszy akcent
          900: '#393053', // bardzo ciemny
          950: '#18122B', // najciemniejszy - tło dark mode
        },
        // Odcienie dla dark mode
        dark: {
          100: '#635985',
          200: '#554c70',
          300: '#4a4363',
          400: '#443C68',
          500: '#3d3660',
          600: '#393053',
          700: '#2d2742',
          800: '#221d32',
          900: '#18122B',
          950: '#110d1f',
        },
        // Jasny tryb
        light: {
          50: '#fafafa',
          100: '#f5f3f7',
          200: '#ebe8f0',
          300: '#ddd8e8',
          400: '#c9c2db',
        },
      },
    },
  },
  plugins: [],
};
