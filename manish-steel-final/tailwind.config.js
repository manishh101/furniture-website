/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0057A3',  // Deep Blue from logo
        'primary-light': '#E6F0FB', // Light blue for subtle elements
        'primary-dark': '#004380', // Darker blue for hover states
        accent: '#FFDB00',   // Bright Yellow from logo
        text: '#333333',
        background: '#F9F9F9',
      },
      fontFamily: {
        heading: ['Poppins', 'Lato', 'Roboto', 'sans-serif'],
        body: ['Open Sans', 'Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
