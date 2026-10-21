/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.js'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-body)', 'system-ui', 'sans-serif'] },
      colors: {
        paper: '#f3f5f4',
        line: '#d5dcdf',
        sidebar: '#1b2b34',
        ink: { DEFAULT: '#17232b', soft: '#4a5a63' },
        accent: { DEFAULT: '#0e7c86', dark: '#0a5f67' },
        danger: '#b3261e',
        // Same hex values as the kiosk screen
        status: { ontime: '#66bb6a', late: '#ffa726', absent: '#ef5350', pending: '#9aa0a6' },
      },
    },
  },
  plugins: [],
}
