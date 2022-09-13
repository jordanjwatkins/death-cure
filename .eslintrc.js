module.exports = {
  root: true,

  extends: [
    'eslint:recommended',
    'airbnb-base'
  ],

  env: {
    browser: true,
    es6: true
  },

  parser: "babel-eslint",

  parserOptions: {
    sourceType: 'module'
  },

  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js',
      },
    }
  },

  rules: {
    'class-methods-use-this': ['off'],
    'comma-dangle': ['error', 'never'],
    'consistent-return': ['off'],

    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        'webpack.config.js',
        'webpack.config.*.js',
        'postcss.config.js',
      ]
    }],

    'max-len': ['off', { code: 120 }],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-param-reassign': ['off', { props: false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-return-assign': ['off'],
    'no-unused-expressions': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'object-curly-newline': ['error', { consistent: true }],
    'operator-linebreak': ['error', 'after'],
    'prefer-const': ['error', { destructuring: 'all' }],

    'padding-line-between-statements': [
      'error',

      // newline-before-return
      { blankLine: 'always', prev: '*', next: 'return' },

      // newline-after-var
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
    ],

    'quote-props': ['error', 'consistent-as-needed'],
    'semi': ['error', 'never']
  }
};
