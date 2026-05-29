import { spawn } from 'node:child_process'

const npmCommand = 'npm'
const useShell = process.platform === 'win32'

const processes = [
  ['backend', ['run', 'dev', '--workspace', 'backend']],
  ['frontend', ['run', 'dev', '--workspace', 'frontend']],
]

let shuttingDown = false

function prefixLines(name, stream, output) {
  stream.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) {
      if (line.trim()) output.write(`[${name}] ${line}\n`)
    }
  })
}

const children = processes.map(([name, args]) => {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    env: process.env,
    shell: useShell,
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  prefixLines(name, child.stdout, process.stdout)
  prefixLines(name, child.stderr, process.stderr)

  child.on('exit', (code, signal) => {
    if (shuttingDown) return

    shuttingDown = true
    stopChildren()

    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 0)
  })

  return child
})

function stopChildren() {
  for (const child of children) {
    if (!child.killed) child.kill()
  }
}

process.on('SIGINT', () => {
  shuttingDown = true
  stopChildren()
  process.exit(130)
})

process.on('SIGTERM', () => {
  shuttingDown = true
  stopChildren()
  process.exit(143)
})
