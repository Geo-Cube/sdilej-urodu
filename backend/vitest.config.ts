import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: ['./test/globalSetup.ts'],
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    execArgv: ['--import', 'tsx/esm'],
    env: {
      DATABASE_URL: 'file:./prisma/test.db',
    },
  },
})
