module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  settings: {
    react: {
      version: '18.2'
    }
  },
  rules: {
    'semi': ['error', 'always'], // 强制分号
    'quotes': ['error', 'single'], // 强制单引号
    'indent': ['error', 2], // 强制2空格缩进
    'no-unused-vars': 'warn', // 未使用变量警告
    'react/prop-types': 'off', // 关闭prop-types校验（如用TS可关闭）
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: true,
        tabWidth: 2,
        trailingComma: 'none',
        printWidth: 100
      }
    ]
  }
};
