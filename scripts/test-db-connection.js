/**
 * Test database connection
 * Run with: node scripts/test-db-connection.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    // Try to connect
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful!', result)
    
    // Check if database exists
    const databases = await prisma.$queryRaw`SHOW DATABASES`
    console.log('📊 Available databases:', databases)
    
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n🔧 Troubleshooting steps:')
      console.log('1. Make sure Laragon MySQL is running')
      console.log('2. Check if MySQL is listening on port 3306')
      console.log('3. Verify DATABASE_URL in .env.local is correct')
      console.log('4. Try restarting Laragon MySQL service')
    } else if (error.message.includes("Unknown database")) {
      console.log('\n🔧 Database does not exist!')
      console.log('1. Open Laragon → Database')
      console.log('2. Create a database named "travellatvia"')
      console.log('3. Or update DATABASE_URL in .env.local with correct database name')
    } else if (error.message.includes("Access denied")) {
      console.log('\n🔧 Authentication failed!')
      console.log('1. Check if MySQL requires a password')
      console.log('2. Update DATABASE_URL: mysql://root:YOUR_PASSWORD@127.0.0.1:3306/travellatvia')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

