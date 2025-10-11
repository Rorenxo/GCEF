// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        // Ito ang standard na path para sa Vite/React/TSX projects:
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // ... iba pang config mo
    theme: {
        extend: {colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
            // ...
        },
    },
    plugins: [],
}
     