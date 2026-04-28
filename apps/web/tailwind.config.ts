import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Promesa Latina
        navy: {
          DEFAULT: '#1F3A93',
          dark:    '#162b6e',
          light:   '#2a4db5',
          50:      '#eef2fb',
          100:     '#d5dff5',
        },
        brand: {
          orange:       '#E65100',
          'orange-light': '#FF6D00',
        },
      },
      fontFamily: {
        title: ['Poppins', 'sans-serif'],
        body:  ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        'card-sm': '0 2px 8px rgba(31,58,147,0.08)',
        'card-md': '0 6px 24px rgba(31,58,147,0.12)',
        'card-lg': '0 16px 48px rgba(31,58,147,0.18)',
      },
    },
  },
  plugins: [],
}

export default config
