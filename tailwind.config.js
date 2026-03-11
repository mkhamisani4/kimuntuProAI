module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'interview-modal-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'interview-backdrop-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'interview-view-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'interview-slide-next': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'interview-thankyou-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'interview-modal-in': 'interview-modal-in 0.25s ease-out forwards',
        'interview-backdrop-in': 'interview-backdrop-in 0.2s ease-out forwards',
        'interview-view-in': 'interview-view-in 0.3s ease-out forwards',
        'interview-slide-next': 'interview-slide-next 0.25s ease-out forwards',
        'interview-thankyou-in': 'interview-thankyou-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
