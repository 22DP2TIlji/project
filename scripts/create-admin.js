/**
 * Script to create an admin user in the database
 * Run this with: node scripts/create-admin.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const adminEmail = 'admin@gmail.com'
    const adminPassword = 'adminpassword'
    const adminName = 'Admin'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      console.log('Updating to admin role...')
      
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'admin' },
      })
      
      console.log('✅ Admin role updated successfully!')
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('Role:', admin.role)
    console.log('ID:', admin.id)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

