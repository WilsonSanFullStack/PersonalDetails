/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Fondo principal oscuro
        background: "#181A20",
        // Texto principal claro
        text: "#F4F4F4",
        // Texto secundario
        textSecondary: "#B0B3B8",
        // Títulos/acento
        accent: "#FF9427",
        // Bordes y elementos sutiles
        border: "#23262F",
        // Error
        error: "#FF4C4C",
        // Éxito
        success: "#4CAF50",
        // Advertencia
        warning: "#FFC107",
        // Otros
        primary: "#23262F",
        secondary: "#393E46",
        muted: "#22242A",
      },
    },
  },
  plugins: [],
};
