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
          "primary": "#00B4D8",          // Cyan Tecnológico Codemix (HSL 190)
          "primary-content": "#04161C",
          "secondary": "#F77F00",        // Laranja de Ação/Destaque (HSL 28)
          "secondary-content": "#1A0D00",
          "accent": "#7209B7",           // Roxo IA / Copilot
          "neutral": "#1E293B",          // Slate estrutural
          "base-100": "#0B0F19",         // Fundo principal (Deep Space)
          "base-200": "#111827",         // Cards e Sidebar
          "base-300": "#1F2937",         // Bordas e Hover states
          "base-content": "#F8FAFC",     // Texto primário
          "info": "#38BDF8",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--tab-radius": "0.5rem",
        },
        "codemix-light": {
          "primary": "#0077B6",
          "secondary": "#EA580C",
          "accent": "#6D28D9",
          "neutral": "#334155",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
          "base-content": "#0F172A",
        }
      }
    ],
    darkTheme: "codemix-dark",
  },
};

