/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  safelist: [
    "w-12", "mx-auto", "justify-center", "justify-start",
    "mx-2", "px-3", "bg-white/30", "bg-white/25", "bg-white/20", "bg-white/15",
    "text-white", "text-white/70", "text-white/60",
    "hover:text-white", "hover:bg-white/20", "hover:bg-white/15",
    "w-56", "w-16", "opacity-0", "opacity-100", "max-w-0",
    "max-w-[10rem]", "max-h-0", "ml-0", "ml-3",
  ],
  theme: {
    extend: {
      colors: {
        offwhite: "#f9f5f0",
        darksidebar: "#111827",
        pastelPink: "#FF758C",
        pastelOrange: "#FF7EB3"
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif']
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fadeIn': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fadeIn': 'fadeIn 0.3s ease-out',
      },
    }
  },
  plugins: []
};
