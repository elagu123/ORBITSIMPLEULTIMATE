// Coverage configuration for different types of testing

module.exports = {
  // Critical components that need high coverage
  critical: {
    functions: 90,
    branches: 85,
    lines: 90,
    statements: 90,
    paths: [
      'src/services/authService.ts',
      'src/services/aiServiceSecure.ts',
      'src/utils/validation.ts',
      'src/store/optimized/**/*.tsx',
      'src/components/ui/ValidatedInput.tsx'
    ]
  },
  
  // Important components with moderate coverage requirements
  important: {
    functions: 80,
    branches: 75,
    lines: 80,
    statements: 80,
    paths: [
      'src/app/**/*.tsx',
      'src/components/features/**/*.tsx',
      'src/hooks/**/*.ts',
      'src/services/**/*.ts'
    ]
  },
  
  // Less critical files with basic coverage
  basic: {
    functions: 60,
    branches: 50,
    lines: 60,
    statements: 60,
    paths: [
      'src/components/ui/**/*.tsx',
      'src/utils/**/*.ts',
      'src/types/**/*.ts'
    ]
  },
  
  // Files to exclude from coverage
  exclude: [
    'src/tests/**/*',
    'src/**/*.test.{ts,tsx}',
    'src/**/*.spec.{ts,tsx}',
    'src/**/__tests__/**/*',
    'src/main.tsx',
    'src/vite-env.d.ts',
    'src/**/*.d.ts',
    'src/docs/**/*'
  ]
};