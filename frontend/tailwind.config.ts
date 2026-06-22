import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#861D6D',
          foreground: '#ffffff',
          50:  '#fdf4fb',
          100: '#f9e4f5',
          200: '#f2c8eb',
          300: '#e89fd9',
          400: '#d668bc',
          500: '#c0429d',
          600: '#a32e82',
          700: '#861D6D',
          800: '#6d1858',
          900: '#5a1549',
        },
        secondary: {
          DEFAULT: '#B24799',
          foreground: '#ffffff',
        },
        brand: {
          background: '#FAF7FB',
          foreground: '#1D1D1F',
          muted: '#F0E4EE',
          border: '#E8D5E5',
          input: '#F5EDF4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
