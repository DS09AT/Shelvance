import { type Config } from 'tailwindcss';

export default {
  theme: {
    typography: ({ theme }) => ({
      DEFAULT: {
        css: {
          '--tw-prose-body': theme('colors.zinc.700'),
          '--tw-prose-headings': theme('colors.zinc.900'),
          '--tw-prose-links': theme('colors.emerald.500'),
          '--tw-prose-links-hover': theme('colors.emerald.600'),
          '--tw-prose-links-underline': theme('colors.emerald.500 / 0.3'),
          '--tw-prose-bold': theme('colors.zinc.900'),
          '--tw-prose-counters': theme('colors.zinc.500'),
          '--tw-prose-bullets': theme('colors.zinc.300'),
          '--tw-prose-hr': theme('colors.zinc.900 / 0.05'),
          '--tw-prose-quotes': theme('colors.zinc.900'),
          '--tw-prose-quote-borders': theme('colors.zinc.200'),
          '--tw-prose-captions': theme('colors.zinc.500'),
          '--tw-prose-code': theme('colors.zinc.900'),
          '--tw-prose-code-bg': theme('colors.zinc.100'),
          '--tw-prose-code-ring': theme('colors.zinc.300'),
          '--tw-prose-th-borders': theme('colors.zinc.300'),
          '--tw-prose-td-borders': theme('colors.zinc.200'),

          '--tw-prose-invert-body': theme('colors.zinc.400'),
          '--tw-prose-invert-headings': theme('colors.white'),
          '--tw-prose-invert-links': theme('colors.emerald.400'),
          '--tw-prose-invert-links-hover': theme('colors.emerald.500'),
          '--tw-prose-invert-links-underline': theme(
            'colors.emerald.500 / 0.3',
          ),
          '--tw-prose-invert-bold': theme('colors.white'),
          '--tw-prose-invert-counters': theme('colors.zinc.400'),
          '--tw-prose-invert-bullets': theme('colors.zinc.600'),
          '--tw-prose-invert-hr': theme('colors.white / 0.05'),
          '--tw-prose-invert-quotes': theme('colors.zinc.100'),
          '--tw-prose-invert-quote-borders': theme('colors.zinc.700'),
          '--tw-prose-invert-captions': theme('colors.zinc.400'),
          '--tw-prose-invert-code': theme('colors.white'),
          '--tw-prose-invert-code-bg': theme('colors.zinc.700 / 0.15'),
          '--tw-prose-invert-code-ring': theme('colors.white / 0.1'),
          '--tw-prose-invert-th-borders': theme('colors.zinc.600'),
          '--tw-prose-invert-td-borders': theme('colors.zinc.700'),

          color: 'var(--tw-prose-body)',
          fontSize: theme('fontSize.sm')[0],
          lineHeight: theme('lineHeight.7'),

          p: {
            marginTop: theme('spacing.6'),
            marginBottom: theme('spacing.6'),
          },

          a: {
            color: 'var(--tw-prose-links)',
            textDecoration: 'underline transparent',
            fontWeight: '500',
            transitionProperty: 'color, text-decoration-color',
            transitionDuration: theme('transitionDuration.DEFAULT'),
            transitionTimingFunction: theme('transitionTimingFunction.DEFAULT'),
            '&:hover': {
              color: 'var(--tw-prose-links-hover)',
              textDecorationColor: 'var(--tw-prose-links-underline)',
            },
          },

          strong: {
            color: 'var(--tw-prose-bold)',
            fontWeight: '600',
          },

          code: {
            color: 'var(--tw-prose-code)',
            borderRadius: theme('borderRadius.lg'),
            paddingTop: theme('padding.1'),
            paddingRight: theme('padding[1.5]'),
            paddingBottom: theme('padding.1'),
            paddingLeft: theme('padding[1.5]'),
            boxShadow: 'inset 0 0 0 1px var(--tw-prose-code-ring)',
            backgroundColor: 'var(--tw-prose-code-bg)',
            fontSize: theme('fontSize.2xs')[0],
          },

          h1: {
            color: 'var(--tw-prose-headings)',
            fontWeight: '700',
            fontSize: theme('fontSize.2xl')[0],
            marginBottom: theme('spacing.2'),
          },

          h2: {
            color: 'var(--tw-prose-headings)',
            fontWeight: '600',
            fontSize: theme('fontSize.lg')[0],
            marginTop: theme('spacing.16'),
            marginBottom: theme('spacing.2'),
          },

          h3: {
            color: 'var(--tw-prose-headings)',
            fontSize: theme('fontSize.base')[0],
            fontWeight: '600',
            marginTop: theme('spacing.10'),
            marginBottom: theme('spacing.2'),
          },
        },
      },
      invert: {
        css: {
          '--tw-prose-body': 'var(--tw-prose-invert-body)',
          '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
          '--tw-prose-links': 'var(--tw-prose-invert-links)',
          '--tw-prose-links-hover': 'var(--tw-prose-invert-links-hover)',
          '--tw-prose-links-underline':
            'var(--tw-prose-invert-links-underline)',
          '--tw-prose-bold': 'var(--tw-prose-invert-bold)',
          '--tw-prose-counters': 'var(--tw-prose-invert-counters)',
          '--tw-prose-bullets': 'var(--tw-prose-invert-bullets)',
          '--tw-prose-hr': 'var(--tw-prose-invert-hr)',
          '--tw-prose-quotes': 'var(--tw-prose-invert-quotes)',
          '--tw-prose-quote-borders': 'var(--tw-prose-invert-quote-borders)',
          '--tw-prose-captions': 'var(--tw-prose-invert-captions)',
          '--tw-prose-code': 'var(--tw-prose-invert-code)',
          '--tw-prose-code-bg': 'var(--tw-prose-invert-code-bg)',
          '--tw-prose-code-ring': 'var(--tw-prose-invert-code-ring)',
          '--tw-prose-th-borders': 'var(--tw-prose-invert-th-borders)',
          '--tw-prose-td-borders': 'var(--tw-prose-invert-td-borders)',
        },
      },
    }),
  },
} satisfies Config;
