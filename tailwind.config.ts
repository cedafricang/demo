import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soundhous brand palette — CED Africa Group Master Brand System v1.0
        // and Soundhous Brand Guide, Phase 2B.
        cream: "#F7F5F0", // Paper Cream — default surface
        bone: "#FAFAF7", // Bone White — high-contrast surface
        stone: "#E8E4DC", // Stone — subtle backgrounds
        sand: "#C9C0B0", // Sand
        smoke: "#6B6B66", // Smoke — secondary text
        charcoal: "#2C2C24", // Charcoal — primary text / editorial
        ink: "#1A1A16", // Ink — maximum weight / dark surface
        copper: "#A87E5E", // Acoustic Copper — Soundhous sole accent, ≤5% of a page
        bronze: "#B8A882", // Bronze Gold — CED Africa Group anchor metal, used only
        // where a piece explicitly ties Soundhous to the Group.
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Cambria", "Georgia", "serif"],
        body: [
          "var(--font-jakarta)",
          "Calibri",
          "Aptos",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains)",
          "Consolas",
          "ui-monospace",
          "monospace",
        ],
      },
      letterSpacing: {
        label: "0.18em",
        eyebrow: "0.12em",
      },
      maxWidth: {
        page: "1400px",
      },
      transitionTimingFunction: {
        quiet: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
export default config;