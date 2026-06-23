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
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#B24799',
          foreground: '#FFFFFF',
        },
        background: '#FAF7FB',
        foreground: '#1D1D1F',
        muted: {
          DEFAULT: '#F4F0F5',
          foreground: '#717182',
        },
        border: 'rgba(134,29,109,0.12)',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1D1D1F',
        },
        'input-background': '#F8F4F9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
