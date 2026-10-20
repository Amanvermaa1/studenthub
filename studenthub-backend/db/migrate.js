const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: Number(process.env.DB_PORT),
});

async function printStatus() {
  const tables = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );

  console.log("\n=== Database status ===");
  for (const row of tables.rows) {
    const count = await pool.query(`SELECT COUNT(1) AS n FROM ${row.table_name}`);
    const indexes = await pool.query(
      "SELECT COUNT(1) AS n FROM pg_indexes WHERE schemaname = 'public' AND tablename = $1",
      [row.table_name]
    );
    console.log(
      `  ${row.table_name.padEnd(12)} rows=${String(count.rows[0].n).padEnd(5)} indexes=${indexes.rows[0].n}`
    );
  }

  const tz = await pool.query(
    "SELECT data_type FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'created_at'"
  );
  console.log(`  posts.created_at type: ${tz.rows[0].data_type}`);
}

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, "migrations");
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Applying migration: ${file}`);
    await pool.query(sql);
  }
}

async function main() {
  const statusOnly = process.argv.includes("--status");

  if (!statusOnly) {
    const file = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(file, "utf8");

    console.log("Applying db/schema.sql ...");
    await pool.query(sql);
    console.log("Schema applied.");

    await applyMigrations();
    console.log("Migrations applied.");
  }

  await printStatus();
  await pool.end();
}

main().catch((error) => {
  console.error("DB migrate failed:", error.message);
  process.exit(1);
});
