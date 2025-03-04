require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    const query = fs.readFileSync('init-db.sql', 'utf8');
    await pool.query(query);
    console.log("Tabla 'messages' creada/verificada correctamente.");
  } catch (error) {
    console.error("Error al ejecutar el script SQL:", error);
  } finally {
    pool.end();
  }
}

setupDatabase();
