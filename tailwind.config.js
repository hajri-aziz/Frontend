/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        teal: { 100: '#E6FFFA', 300: '#4FD1C5' },
        sky: { 700: '#2B6CB0', 800: '#2C5282' },
        blue: { 100: '#EBF8FF' },
        indigo: { 200: '#C3DAFE', 300: '#A3BFFA', 400: '#7F9CF5' },
        gray: { 600: '#4A5568' },
        zinc: { 300: '#D4D4D4', 600: '#718096', 900: '#1A202C' },
        neutral: { 400: '#A0AEC0' },
        slate: { 50: '#F8FAFC' },
        // Couleurs utilisées dans SocialFeedComponent
        zenaura: {
          bg: '#F4FEFF',
          text: '#172048',
          gray: '#707070',
          teal: '#04789D',
          darkGray: '#444444',
          postText: '#080808',
          postGray: '#66676B',
          divider: '#CFD0D4',
          avatarBg: '#C4C4C4',
          commentBg: '#F1F2F5',
          iconGray: '#8C939C'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        helvetica_neue: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif']
      },
      fontSize: {
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }]
      },
      letterSpacing: {
        'custom-2.5': '2.5px',
        'custom-2.8': '2.8px',
        'custom-3.6': '3.6px',
        widest: '0.1em'
      },
      boxShadow: {
        'custom-button': '4px 8px 12px rgba(78, 99, 141, 0.06)',
        'custom-card': '0px 4px 4px rgba(0, 0, 0, 0.25)',
        'custom-nav': '0px 4.708333492279053px 7.062500476837158px rgba(1, 115, 153, 0.2)',
        'social-feed': '0px 1.33px 40px rgba(0, 0, 0, 0.2)'
      },
      spacing: { 9: '2.25rem', '2.5': '0.625rem' },
      borderRadius: { '80': '80px', '30': '30px', '133.44': '133.44px' }
    }
  },
  plugins: []
};
