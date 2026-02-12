/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Discord-inspired colors for dark mode
        discord: {
          primary: '#36393f',
          secondary: '#2f3136',
          tertiary: '#202225',
          accent: '#5865f2',
          text: {
            primary: '#dcddde',
            secondary: '#b9bbbe',
            muted: '#72767d',
          },
        },
      },
    },
  },
  plugins: [],
};
