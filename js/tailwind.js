tailwind.config = {
  theme: {
    extend: {
      colors: {
        // --- Core Colors Mapped to CSS Variables ---
        // Tailwind class: `text-baby-blue`, `bg-baby-blue`
        // Reads value from: var(--color-accent)
        'baby-blue': 'var(--color-accent)', 

        // Tailwind class: `bg-dark-navy`
        // Reads value from: var(--color-background)
        'dark-navy': 'var(--color-background)', 

        // Tailwind class: `bg-dark-surface`
        // Reads value from: var(--color-surface)
        'dark-surface': 'var(--color-surface)',
      },
      boxShadow: {
        // The neon-glow MUST use a transparent version of the variable
        'neon-glow': '0 0 8px var(--color-accent), 0 0 20px var(--color-accent-shadow)',
      },
      fontFamily: {
        electrolize: ['Electrolize', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
};