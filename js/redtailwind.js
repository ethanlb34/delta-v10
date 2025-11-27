tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'electrolize', 'sans-serif'],
            },
            colors: 
                
                // --- NEW RED THEME COLORS ---
                'dark-red-bg': '#140000',      // Extremely dark red background
                'red-accent': '#FF3848',       // Bright neon red accent/glow
                'red-active': '#FF7373',       // Light red active text/icons
                'dark-red-active': '#5C0000',  // Medium dark red active background
            },
            boxShadow: {

                // --- NEW RED SHADOWS ---
                'neon-red-glow': '0 0 5px #FF3848, 0 0 10px #FF3848, 0 0 20px rgba(255, 56, 72, 0.6)',
                'neon-red-sm': '0 0 2px #FF3848',
            },
        }
    }
}