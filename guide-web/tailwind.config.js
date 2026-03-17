/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: { 50: '#FFF1F2', 100: '#FFE1E3', 200: '#FFC8CB', 300: '#FFA0A5', 400: '#FB414D', 500: '#E0323E', 600: '#C22530', 700: '#9E1D28', 800: '#7A1720', 900: '#5C131B' },
        ink: { 50: '#F7F7F8', 100: '#EFEFEF', 200: '#D8D8DA', 300: '#B5B5B9', 400: '#8E8E94', 500: '#6B6B73', 600: '#55555C', 700: '#3D3D42', 800: '#27272A', 900: '#18181B', 950: '#0A0A0B' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
