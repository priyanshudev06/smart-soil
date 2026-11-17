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
        "vertex-bg": "#FBFBFA",
        "vertex-card": "#FFFFFF",
        "vertex-surface": "#F4F4F2",
        "vertex-dark": "#111827",
        "vertex-espresso": "#1E0B09",
        "vertex-rust": "#B02310",
        "vertex-terracotta": "#C2410C",
        "vertex-steel": "#354B62",
        "vertex-blue": "#396A94",
        "vertex-softblue": "#EBF2F7",
        "vertex-border": "#E5E7EB",
        "vertex-muted": "#6B7280",
        "vertex-emerald": "#047857",
        "vertex-emerald-bg": "#ECFDF5",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'vertex': '0 1px 3px rgba(0,0,0,0.05), 0 20px 40px -15px rgba(0,0,0,0.05)',
        'vertex-hover': '0 20px 50px -10px rgba(0,0,0,0.12)',
        'glow-rust': '0 0 25px rgba(176, 35, 16, 0.35)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
