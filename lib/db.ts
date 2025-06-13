import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: '127.0.0.1', // Use IP instead of localhost
  port: 3306,      // MAMP's default MySQL port
  user: 'root',      // default MAMP username
  password: 'root',  // default MAMP password
  database: 'travellatvia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool 