require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://neondb_owner:npg_EsWepzF0ukB4@ep-dark-sky-a47m340x-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log("Conectado a PostgreSQL"))
  .catch(err => console.error("Error de conexión", err));

module.exports = pool;