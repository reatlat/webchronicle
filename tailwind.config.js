import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{md,njk,js,css}"
    ],
    theme: {
        fontFamily: {
            sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Noto Sans", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji"],
            mono: ["PT Mono", "Roboto Mono", "JetBrains Mono", "monospace"],
        },
        extend: {
            typography: ({ theme }) => ({
                zincDark: {
                    css: {
                        '--tw-prose-body': theme('colors.zinc[200]'),
                        '--tw-prose-headings': theme('colors.zinc[100]'),
                        '--tw-prose-lead': theme('colors.zinc[300]'),
                        '--tw-prose-links': theme('colors.zinc[100]'),
                        '--tw-prose-bold': theme('colors.zinc[100]'),
                        '--tw-prose-counters': theme('colors.zinc[400]'),
                        '--tw-prose-bullets': theme('colors.zinc[600]'),
                        '--tw-prose-hr': theme('colors.zinc[300]'),
                        '--tw-prose-quotes': theme('colors.zinc[100]'),
                        '--tw-prose-quote-borders': theme('colors.zinc[300]'),
                        '--tw-prose-captions': theme('colors.zinc[300]'),
                        '--tw-prose-code': theme('colors.zinc[100]'),
                        '--tw-prose-pre-code': theme('colors.zinc[200]'),
                        '--tw-prose-pre-bg': theme('colors.zinc[100]'),
                        '--tw-prose-th-borders': theme('colors.zinc[300]'),
                        '--tw-prose-td-borders': theme('colors.zinc[300]'),
                        '--tw-prose-invert-body': theme('colors.zinc[300]'),
                        '--tw-prose-invert-headings': theme('colors.white'),
                        '--tw-prose-invert-lead': theme('colors.zinc[300]'),
                        '--tw-prose-invert-links': theme('colors.white'),
                        '--tw-prose-invert-bold': theme('colors.white'),
                        '--tw-prose-invert-counters': theme('colors.zinc[600]'),
                        '--tw-prose-invert-bullets': theme('colors.zinc[400]'),
                        '--tw-prose-invert-hr': theme('colors.zinc[300]'),
                        '--tw-prose-invert-quotes': theme('colors.zinc[200]'),
                        '--tw-prose-invert-quote-borders': theme('colors.zinc[300]'),
                        '--tw-prose-invert-captions': theme('colors.zinc[600]'),
                        '--tw-prose-invert-code': theme('colors.white'),
                        '--tw-prose-invert-pre-code': theme('colors.zinc[300]'),
                        '--tw-prose-invert-pre-bg': 'rgb(255 255 255 / 50%)',
                        '--tw-prose-invert-th-borders': theme('colors.zinc[400]'),
                        '--tw-prose-invert-td-borders': theme('colors.zinc[300]'),
                    },
                },
            }),
        },
    },
    plugins: [ typography ],
}

