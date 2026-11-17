/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "page-bg": "#FAF9F5",
        "panel-bg": "#F0EFEB",
        "soft-card": "#E9E8E4",
        "soft-card-2": "#F4F3EF",
        "text-main": "#1B1B1B",
        "muted": "#8C8880",
        "muted-light": "#BDBAB2",
        "line": "#D9D7D0",
        "deep-black": "#151515",
        "white-card": "#FFFDF8",
        "emerald-pulse": "#00A86B",
        "amber-pulse": "#F59E0B",
        "electric-blue": "#2563EB"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        'card': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(27, 27, 27, 0.05)',
        'float': '0 12px 36px -4px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
