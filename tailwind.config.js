/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B8956E',
          50: '#F8F4F0',
          100: '#F2EBE2',
          200: '#E6D3B3',
          300: '#D9BB96',
          400: '#C4A079',
          500: '#B8956E',
          600: '#A07F5D',
          700: '#866A4C',
          800: '#6C553D',
          900: '#52402E',
        },
        secondary: {
          DEFAULT: '#111111',
          50: '#F7F7F7',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B2B2B2',
          400: '#999999',
          500: '#7F7F7F',
          600: '#666666',
          700: '#4C4C4C',
          800: '#333333',
          900: '#191919',
        },
        accent: '#E6D3B3',
        ink: '#1A1815',
        clay: '#8B5E3C',
        hairline: '#E2D9CC',
        gold: '#B8956E',
        'gold-light': '#D9BB96',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Inter', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        'display-ar': ['Cairo', 'Fraunces', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 12px 25px -5px rgba(0, 0, 0, 0.05)',
        'hard': '0 10px 40px -5px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.28em',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      screens: {
        'xs': '475px',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            h1: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
            },
            h3: {
              color: theme('colors.gray.900'),
              fontWeight: '600',
            },
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.600'),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [],
};
