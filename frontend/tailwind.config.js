/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#8B5CF6', // Example mapping based on previous purple theme
          DEFAULT: '#7C3AED',
          dark: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#10B981', // Emerald/Green for success/secondary actions
        },
        background: '#f8fafc',
      },
    },
  },
  plugins: [],
}
