/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          green: {
            DEFAULT: '#2E6F40',
            dark: '#1E5128',
            light: '#E8F5E9',
          },
          earth: {
            DEFAULT: '#C86D3B',
            dark: '#9E4A20',
            light: '#FDF2E9',
          },
          harvest: {
            DEFAULT: '#D99B26',
            dark: '#9E6B0D',
            light: '#FEF9C3',
          },
          sky: {
            DEFAULT: '#2563EB',
            dark: '#1D4ED8',
            light: '#DBEAFE',
          },
          canvas: '#F5F3EE',
          surface: '#FAF8F5',
          border: '#E5E0D8',
          text: '#2C2825',
          muted: '#6C665D',
        },
      },
      boxShadow: {
        clay: '8px 8px 20px rgba(165, 145, 125, 0.40), -8px -8px 20px #FFFFFF',
        'clay-sm': '4px 4px 12px rgba(165, 145, 125, 0.30), -4px -4px 12px #FFFFFF',
        'clay-hover': '12px 12px 26px rgba(150, 130, 110, 0.50), -12px -12px 26px #FFFFFF',
        'clay-inset': 'inset 3px 3px 6px rgba(120, 100, 80, 0.12), inset -3px -3px 6px rgba(255, 255, 255, 0.85)',
      },
      borderRadius: {
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
