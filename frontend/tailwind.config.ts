import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#FEF7F0',
        beige: '#D7BFAE',
        brown: '#8B5E3C',
        tan: '#F1E4D1',
        deepbrown: '#3C2F2F',
        amber: '#B08968',
        earthy: '#B36A5E',
        dark: {
          bg: '#0A0908',
          surface: '#1A1816',
          card: '#252220',
          border: '#3D3935',
          text: '#F5EDE0',
          muted: '#B8AFA3',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(176, 137, 104, 0.4), 0 4px 6px -2px rgba(176, 137, 104, 0.05)',
      },
    },
  },
  plugins: [],
}
export default config
