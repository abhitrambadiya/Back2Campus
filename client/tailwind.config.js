/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        float: 'float 6s ease-in-out infinite',
        floatReverse: 'floatReverse 7s ease-in-out infinite',
        slideIn: 'slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        fadeIn: 'fadeIn 1s ease-out forwards',
        scaleIn: 'scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
          '100%': { transform: 'translateY(0px) rotate(0deg)' },
        },
        floatReverse: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-2deg)' },
          '100%': { transform: 'translateY(0px) rotate(0deg)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",
        // legacy colors for compatibility
        'primary-color': '#6366F1',
        'primary-dark': '#4F46E5',
        'soft-gray': '#F3F4F6',
        'darkest-gray': '#18181B',
        'darker-gray': '#52525B',
        'cool-gray': '#A1A1AA',
        'near-black': '#18181B',
        'slate-gray': '#E5E7EB',
      },
    },
  },
  plugins: [],
}