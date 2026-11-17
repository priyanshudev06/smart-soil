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
        "bio-bg": "#F8FAFC",
        "bio-card": "#FFFFFF",
        "bio-dark": "#0F172A",
        "bio-navy": "#1E293B",
        "bio-emerald": "#10B981",
        "bio-emerald-dark": "#059669",
        "bio-cyan": "#06B6D4",
        "bio-blue": "#0EA5E9",
        "bio-amber": "#F59E0B",
        "bio-purple": "#8B5CF6",
        "bio-slate": "#64748B",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        '3d-emerald': '0 8px 0 #059669, 0 15px 25px rgba(16, 185, 129, 0.35)',
        '3d-emerald-active': '0 2px 0 #059669, 0 5px 10px rgba(16, 185, 129, 0.25)',
        '3d-dark': '0 8px 0 #020617, 0 15px 25px rgba(15, 23, 42, 0.3)',
        '3d-dark-active': '0 2px 0 #020617, 0 5px 10px rgba(15, 23, 42, 0.2)',
        'float-lg': '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
        'glow-emerald': '0 0 35px rgba(16, 185, 129, 0.4)',
        'glow-cyan': '0 0 35px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}
