import mysql from 'mysql2/promise'

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // default MAMP username
  password: 'root', // default MAMP password
  database: 'latvia_travel', // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool 