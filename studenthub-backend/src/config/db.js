const { Pool } = require("pg");

// SSL is required when connecting to a managed Postgres from outside the
// provider's private network (Render external database, Neon, Supabase, ...).
// Inside the provider network it must stay disabled.
const useSsl =
  process.env.DB_SSL === "true" ||
  process.env.DATABASE_URL?.includes("sslmode=require");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT),
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

pool.on("error", (error) => {
  console.error("Unexpected postgres pool error:", error.message);
});

module.exports = pool;
