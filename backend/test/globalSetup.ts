import { execSync } from 'node:child_process'

export async function setup() {
  execSync('npx prisma db push --url file:./prisma/test.db', {
    stdio: 'inherit',
  })
}
