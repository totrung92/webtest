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
	pool= new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, family: 4 });
}

app.get("/", (req, res) => {
  res.send("✅ Backend is running");
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

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, password]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Insert error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT id, username FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, id: result.rows[0].id, username: result.rows[0].username });
    } else {
      res.json({ success: false, message: "Sai tên đăng nhập hoặc mật khẩu!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "DB error" });
  }
});

app.get("/api/family/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params; // lấy id từ URL
    const result = await pool.query("SELECT * FROM family_members WHERE user_id = $1", [user_id]);

    if (result.rows.length === 0) {
      return res.json({ message: "Member not found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/api/family", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM family_members ORDER BY id ASC");
    res.json(result.rows); // trả về toàn bộ
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/api/family", async (req, res) => {
  try {
    let { user_id, name, gender, birth, avatar, description, parent_id, partner_id, rootnode } = req.body;

    // Xử lý birth: nếu chỉ có năm, chuyển thành yyyy-01-01
    if (birth && /^\d{4}$/.test(birth)) {
      birth = `${birth}-01-01`;
    }
    console.log("Processed birth date:", birth);
    const result = await pool.query(
      `INSERT INTO family_members (user_id, name, gender, birth, avatar, description, parent_id, partner_id, rootnode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user_id, name, gender, birth, avatar, description, parent_id, partner_id, rootnode]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.put("/api/family/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { name, gender, birth, description, avatar } = req.body;
console.log("Received edit data:", req.body);
    // Nếu birth chỉ có năm, chuyển thành yyyy-01-01
    if (birth && /^\d{4}$/.test(birth)) {
      birth = `${birth}-01-01`;
    }

    if (!birth) birth = null;
    console.log("Processed birth date:", birth);
    const result = await pool.query(
      `UPDATE family_members
       SET name = $1,
           gender = $2,
           birth = $3,
           description = $4,
           avatar = $5
       WHERE id = $6
       RETURNING *`,
      [name, gender, birth, description, avatar, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
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
