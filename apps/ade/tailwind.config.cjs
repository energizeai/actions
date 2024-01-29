const baseConfig = require("@energizeai/tailwindcss-config/base.config.cjs")

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    ...baseConfig.content,
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    "../../packages/*/src/**/*.{ts,tsx}",
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
}