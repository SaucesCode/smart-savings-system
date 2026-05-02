// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          dark: "#5B21B6",
        },
        teal: {
          DEFAULT: "#0D9488",
          light: "#5EEAD4",
          dark: "#0F766E",
        },
        coral: {
          DEFAULT: "#F43F5E",
          light: "#FDA4AF",
          dark: "#E11D48",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
          dark: "#D97706",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "Nunito", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1.25rem", // 20px — our card radius
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.08)",
        "card-hover": "0 12px 36px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
