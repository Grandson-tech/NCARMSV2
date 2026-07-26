/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.html', './layouts/**/*.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        workspace: '#F5F6F8',
        'warm-surface': '#FFF9F1',
      },
      borderRadius: {
        control: '0.75rem',
        surface: '1.125rem',
      },
      boxShadow: {
        surface: '0 1px 2px rgba(15, 23, 42, 0.035), 0 2px 6px rgba(15, 23, 42, 0.045)',
        elevated: '0 8px 20px rgba(15, 23, 42, 0.075)',
      },
    },
  },
  plugins: [],
}
