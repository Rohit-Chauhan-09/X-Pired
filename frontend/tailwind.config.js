/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        zone: {
          critical: '#ef4444',
          urgent: '#f97316',
          attention: '#eab308',
          safe: '#22c55e',
        }
      },
    },
  },
  plugins: [],
}
