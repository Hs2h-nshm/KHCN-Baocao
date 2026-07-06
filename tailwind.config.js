/** @type {import('tailwindcss').Config} */
// Màu dùng biến CSS (rgb var + <alpha-value>) → giữ được tiện ích opacity như bg-good/20,
// đồng thời đổi được cả bảng màu theo theme Sáng/Tối chỉ bằng cách đổi biến trong index.css.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        panel2: 'rgb(var(--c-panel2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        brand: 'rgb(var(--c-brand) / <alpha-value>)',
        good: 'rgb(var(--c-good) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',
        bad: 'rgb(var(--c-bad) / <alpha-value>)',
        violet: 'rgb(var(--c-violet) / <alpha-value>)',
        chip: 'rgb(var(--c-chip) / <alpha-value>)'
      }
    }
  },
  plugins: []
}
