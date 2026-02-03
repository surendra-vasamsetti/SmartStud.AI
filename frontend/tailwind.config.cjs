module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        soft: {
          bg: "#F9FAF9", // Very warm off-white/cream
          paper: "#FFFFFF", // Pure white for cards
          primary: "#6366F1", // Soft Indigo
          secondary: "#A5B4FC", // Pale Indigo/Lavender
          text: "#1E293B", // Slate 800 for high contrast text
          muted: "#64748B", // Slate 500 for secondary text
          accent: "#F472B6", // Soft Pink
          success: "#34D399", // Soft Green
          warning: "#FBBF24", // Soft Amber
          danger: "#FB7185", // Soft Red
        },
        // Keep existing colors for backward compatibility if needed, or override
        primary: {
          DEFAULT: "#6366F1", // Map to soft primary
          light: "#818CF8",
          dark: "#4F46E5",
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', // Diffused shadow
        'soft-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'], // Ensure a clean font is available (or rely on default)
        cursive: ['"Dancing Script"', 'cursive'],
      },

      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        shimmer: "shimmer 8s linear infinite",
      }
    },
  },
  plugins: [],
};
