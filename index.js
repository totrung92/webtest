const express = require("express");
const { Pool } = require("pg");   // 👈 thêm dòng này

const app = express();
app.use(express.json());

// Cấu hình kết nối Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }   // Render yêu cầu SSL
});
