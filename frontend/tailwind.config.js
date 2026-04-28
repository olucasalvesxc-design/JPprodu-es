/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f3eeff',
          100: '#e7dcff',
          200: '#ccbbfe',
          300: '#a98bfc',
          400: '#8a5cf7',
          500: '#7B3FE4',
          600: '#6a2fd0',
          700: '#5a22b8',
          800: '#4b1d98',
          900: '#3c177a',
        },
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#232332',
          500: '#2d2d42',
          400: '#3d3d58',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7B3FE4 0%, #4b1d98 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0a0f 0%, #111118 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(123,63,228,0.4)',
        'glow-sm': '0 0 10px rgba(123,63,228,0.3)',
      },
    },
  },
  plugins: [],
};
