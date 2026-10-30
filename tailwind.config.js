// Not served (.assetsignore). Build: npx --yes tailwindcss@3.4.19 -i tailwind.input.css -o tailwind.css --minify --no-autoprefixer
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './script.js'], // script.js toggles hidden and invisible at runtime
  // Same rule as styles.css: hover styles only where a pointer can hover, so a tap never leaves a link underlined.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    // Replaced, not extended: a leftover text-white or bg-black compiles to nothing instead of the wrong color.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      // The hex values live once, in styles.css :root. var() colors take no opacity modifiers.
      cream: 'var(--cream)',
      ink: 'var(--ink)',
      umber: 'var(--umber)',
      line: 'var(--line)',
      coral: 'var(--coral)',
    },
    fontFamily: {
      display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'], // Recoleta first only once licensed
      sans: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'], // Coolvetica only for the wordmark, once licensed
    },
    extend: {
      fontSize: {
        h1: ['clamp(2.25rem, 1.6rem + 3.6vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        h2: ['clamp(2rem, 1.5rem + 2vw, 3.25rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h3: ['clamp(1.25rem, 1.15rem + 0.3vw, 1.375rem)', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        coda: ['clamp(1.5rem, 1.2rem + 1.2vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        lead: ['clamp(1.125rem, 0.95rem + 0.75vw, 1.375rem)', { lineHeight: '1.5' }],
        body: ['1.0625rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
      },
      maxWidth: { lead: '34em', measure: '38rem', faq: '46rem' },
    },
  },
};
