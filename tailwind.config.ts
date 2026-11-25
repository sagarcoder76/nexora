import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1412",
        "ink-2": "#13211D",
        "ink-3": "#1C2B26",
        cream: "#F7F4EC",
        sand: "#EDE6D7",
        saffron: "#FF6B2C",
        "saffron-dark": "#E15416",
        teal: "#0F5B52",
        "teal-soft": "#DCEDE7",
        moss: "#8FA65A",
      },
      fontFamily: {
        sans: ["Manrope Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces Variable", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(11,20,18,0.04), 0 18px 40px -24px rgba(11,20,18,0.35)",
        lift: "0 30px 70px -30px rgba(11,20,18,0.45)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      opacity: {
        2: "0.02",
        4: "0.04",
        6: "0.06",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
        22: "0.22",
        35: "0.35",
        45: "0.45",
        55: "0.55",
        65: "0.65",
        85: "0.85",
      },
      keyframes: {
        pulseDot: {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.6)", opacity: "0.45" },
        },
        drift: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2.2s ease-in-out infinite",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
