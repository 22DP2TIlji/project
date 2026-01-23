/**
 * Create the database if it doesn't exist
 * Run with: node scripts/create-database.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const mysql = require('mysql2/promise')

async function createDatabase() {
  // Parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env.local')
    process.exit(1)
  }

  // Extract connection details
  const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):?([^@]*)@([^:]+):(\d+)\/(.+)/)
  if (!urlMatch) {
    console.error('❌ Invalid DATABASE_URL format')
    process.exit(1)
  }

  const [, user, password, host, port, database] = urlMatch

  try {
    console.log('Connecting to MySQL server...')
    // Connect without specifying database
    const connection = await mysql.createConnection({
      host: host || '127.0.0.1',
      port: parseInt(port) || 3306,
      user: user || 'root',
      password: password || '',
    })

    console.log('✅ Connected to MySQL server!')
    console.log(`Creating database "${database}"...`)

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``)
    console.log(`✅ Database "${database}" created successfully!`)

    await connection.end()
    console.log('\n🎉 Next steps:')
    console.log('1. Run: npm run db:push (to create tables)')
    console.log('2. Run: npm run create-admin (to create admin user)')
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 Make sure Laragon MySQL is running!')
    } else if (error.message.includes("Access denied")) {
      console.log('\n🔧 Authentication failed! Check your MySQL password in DATABASE_URL')
    }
    
    process.exit(1)
  }
}

createDatabase()

