import { useEffect, useState } from "react";

function App() {
  const API_URL = "https://webtest-jdej.onrender.com"; // 🔴 Thay bằng URL Render backend của bạn

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Lấy danh sách users khi load trang
  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  // Hàm thêm user mới
  const handleAddUser = async (e) => {
    e.preventDefault();

    const newUser = { name, email };

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to add user");

      const added = await res.json();
      setUsers([...users, added]); // cập nhật state
      setName("");
      setEmail("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Quản lý Users</h1>

      {/* Form thêm user */}
      <form onSubmit={handleAddUser} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button type="submit" style={{ padding: "5px 10px" }}>
          Thêm User
        </button>
      </form>

      {/* Danh sách user */}
      <h2>Danh sách Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
