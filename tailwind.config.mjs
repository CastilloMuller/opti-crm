/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#3d5a80',
        secondary: '#98c1d9',
        background: '#e0fbfc',
        highlight: '#ee6c4d',
        text: '#293241',
      },
    },
  },
  plugins: [],
}