/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        honey: {
          DEFAULT: '#E6A23C',
          dark: '#D4922E',
          light: '#F5D89A',
        },
        bee: {
          bg: '#FFF9EE',
          card: '#FFFFFF',
          border: '#F0E6D2',
          text: '#333333',
          muted: '#999999',
        },
        success: '#2ecc71',
        danger: '#FF4D4F',
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
