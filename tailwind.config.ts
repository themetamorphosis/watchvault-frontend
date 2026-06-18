import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'tui-bg': 'var(--bg)',
        'tui-panel': 'var(--bg-secondary)',
        'tui-input': 'var(--bg-input)',
        'tui-border': 'var(--border-color)',
        'tui-border-muted': 'var(--border-color-muted)',
        'tui-text': 'var(--text-primary)',
        'tui-text-muted': 'var(--text-secondary)',
        'tui-amber': 'var(--accent-amber)',
        'tui-purple': 'var(--accent-purple)',
        'tui-green': 'var(--accent-green)',
        'tui-red': 'var(--accent-red)',
        
        'nav-bg': 'var(--nav-bg)',
        'nav-border': 'var(--nav-border)',
        'nav-text': 'var(--nav-text)',
        'nav-hover-text': 'var(--nav-hover-text)',
        'nav-hover-bg': 'var(--nav-hover-bg)',
        'nav-active-bg': 'var(--nav-active-bg)',
        'nav-active-text': 'var(--nav-active-text)',
      }
    },
  },
  plugins: [typography],
};

export default config;
