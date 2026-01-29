/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mist: "#F8FAFC",
        slate: "#0F172A",
        calm: "#1E293B",
        sky: "#E2E8F0",
        ocean: "#2563EB",
      },
    },
  },
  plugins: [],
};
