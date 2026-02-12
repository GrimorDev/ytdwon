/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta kolorów Vipile
        primary: {
          50: '#f3f1f9',
          100: '#e4e0f0',
          200: '#cdc5e3',
          300: '#afa2d1',
          400: '#9181bd',
          500: '#7c6aab',
          600: '#635985', // główny akcent
          700: '#554c70',
          800: '#443C68',
          900: '#393053',
          950: '#18122B',
        },
        // Dark mode — neutralne, głębokie odcienie
        dark: {
          100: '#4a4a5a',
          200: '#3a3a4a',
          300: '#32323e',
          400: '#2a2a36',
          500: '#22222c',
          600: '#18181f',
          700: '#16161f',
          800: '#131319',
          900: '#111118',
          950: '#0d0d12',
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
