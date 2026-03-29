module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
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
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glowPulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'aurora': {
          '0%, 100%': { transform: 'translateX(0) translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateX(30px) translateY(-20px) rotate(5deg)' },
          '66%': { transform: 'translateX(-20px) translateY(15px) rotate(-3deg)' },
        },
        'gradientShift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'borderGlow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'gentleRotate': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        'interview-modal-in': 'interview-modal-in 0.25s ease-out forwards',
        'interview-backdrop-in': 'interview-backdrop-in 0.2s ease-out forwards',
        'interview-view-in': 'interview-view-in 0.3s ease-out forwards',
        'interview-slide-next': 'interview-slide-next 0.25s ease-out forwards',
        'interview-thankyou-in': 'interview-thankyou-in 0.2s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'glow': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'aurora': 'aurora 12s ease-in-out infinite',
        'aurora-slow': 'aurora 18s ease-in-out infinite',
        'gradient': 'gradientShift 8s ease infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'gentle-rotate': 'gentleRotate 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
