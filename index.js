const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
app.use(cors());
app.use(express.json());
let pool;
if (process.env.NODE_ENV !== "production")
{
	require("dotenv").config({ quiet: true });
	pool = new Pool({
						user: process.env.PG_USER,
						host: process.env.PG_HOST,
						database: process.env.PG_DATABASE,
						password: process.env.PG_PASSWORD,
						port: process.env.PG_PORT,
					});
}
else
{
	pool= new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}

app.get("/", (req, res) => {
  res.send("✅ Backend is running on Render!");
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB error");
  }
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert error");
  }
});
let PORT;
if (process.env.NODE_ENV !== "production")
{
	PORT = process.env.PORT || 5000;
}
else
{
	PORT = process.env.PORT || 3000;
}
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
