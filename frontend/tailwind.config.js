/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],           // 👈 Default for body text
        archivo: ['Archivo', 'sans-serif'],      // 👈 For professional headings
        pacifico: ['Pacifico', 'cursive'],       // 👈 For logos or decorative text
        bebas: ['"Bebas Neue"', 'sans-serif'],   // 👈 Bold, all-caps titles
        lobster: ['"Lobster Two"', 'cursive'],   // 👈 Playful, avoid in dashboards
        savate: ['Savate', 'serif'],             // 👈 Stylish serif, use sparingly
      },
    },
  },
  plugins: [],
}