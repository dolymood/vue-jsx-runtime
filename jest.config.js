module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: [
    'src/*.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.d\\.ts$'
  ],
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  setupFiles: ['./jest-setup.ts'],
  moduleNameMapper: {
    "vue/jsx-runtime": ["<rootDir>/src"],
    "vue/jsx-dev-runtime": ["<rootDir>/src"]
  },
  transform: {
    '\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
};
