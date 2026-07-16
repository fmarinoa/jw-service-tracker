/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#fdfbf7',
        foreground: '#2d241e',
        card: '#faf6f0',
        'card-foreground': '#2d241e',
        primary: '#b86a3d',
        'primary-foreground': '#fdfbf7',
        muted: '#e8e2d9',
        'muted-foreground': '#7b726c',
        border: '#e8e2d9',
      },
    },
  },
  plugins: [],
};
