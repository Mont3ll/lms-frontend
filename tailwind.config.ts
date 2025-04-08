import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // Ensure src dir is included
  ],
  prefix: "", // No prefix usually needed
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Customize colors based on Behance inspiration or brand
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          // Example using purple/blue tones
          DEFAULT: "hsl(var(--primary))", // e.g., 250 80% 60%
          foreground: "hsl(var(--primary-foreground))", // e.g., 210 40% 98%
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // e.g., 210 40% 96.1%
          foreground: "hsl(var(--secondary-foreground))", // e.g., 222.2 47.4% 11.2%
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // e.g., 0 84.2% 60.2%
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // e.g., 210 40% 96.1%
          foreground: "hsl(var(--muted-foreground))", // e.g., 215.4 16.3% 46.9%
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // e.g., 210 40% 96.1%
          foreground: "hsl(var(--accent-foreground))", // e.g., 222.2 47.4% 11.2%
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
