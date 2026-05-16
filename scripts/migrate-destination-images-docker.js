const net = require('net')
const { spawn } = require('child_process')

const DB_HOST = process.env.DESTINATION_IMAGE_DB_HOST || '127.0.0.1'
const DB_PORT = Number(process.env.DESTINATION_IMAGE_DB_PORT || 3306)
const WAIT_TIMEOUT_MS = 60_000

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`${command} is not installed or is not available in PATH`))
        return
      }

      reject(error)
    })
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`))
      }
    })
  })
}

function canConnect() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: DB_HOST, port: DB_PORT })

    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })

    socket.once('error', () => {
      socket.destroy()
      resolve(false)
    })
  })
}

async function waitForDatabase() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
    if (await canConnect()) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`Database is not reachable at ${DB_HOST}:${DB_PORT}`)
}

async function main() {
  await run('docker', ['compose', 'up', '-d', 'db'])
  await waitForDatabase()
  await run('node', ['scripts/migrate-destination-images.js'])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})