/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Jost', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Century Gothic', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        "codemix-dark": {
          "primary": "#f6bc03",
          "primary-content": "#2b2b2b",
          "secondary": "#f1a10b",
          "secondary-content": "#2b2b2b",
          "accent": "#fbd23a",
          "accent-content": "#2b2b2b",
          "neutral": "#44494c",
          "neutral-content": "#fefefe",
          "base-100": "#2b2b2b",
          "base-200": "#1f1f1f",
          "base-300": "#363d3f",
          "base-content": "#fefefe",
          "info": "#6fb0d6",
          "success": "#7bbf4a",
          "warning": "#f1a10b",
          "error": "#e8604f",
          "--rounded-box": "0.375rem",
          "--rounded-btn": "0.25rem",
          "--tab-radius": "0.25rem",
        },
        "codemix-light": {
          "primary": "#f1a10b",
          "primary-content": "#2b2b2b",
          "secondary": "#e98015",
          "secondary-content": "#ffffff",
          "accent": "#a85808",
          "accent-content": "#ffffff",
          "neutral": "#44494c",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#ececec",
          "base-300": "#f4f4f4",
          "base-content": "#2b2b2b",
          "info": "#2d6f96",
          "success": "#3f7a1c",
          "warning": "#b5620b",
          "error": "#b53a2c",
        }
      }
    ],
    darkTheme: "codemix-dark",
  },
};
