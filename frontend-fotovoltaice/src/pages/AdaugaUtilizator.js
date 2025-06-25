import React, { useState, useEffect } from "react";

const AdaugaUtilizator = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("utilizator");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role === "admin") setUserRole("admin");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Completează toate câmpurile!");
      return;
    }

    const res = await fetch("http://localhost:3001/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    if (res.ok) {
      alert("✅ Utilizator adăugat cu succes!");
      setEmail("");
      setPassword("");
      setRole("utilizator");
    } else {
      alert("❌ Eroare la adăugarea utilizatorului.");
    }
  };

  if (userRole !== "admin") {
    return (
      <div style={styles.page}>
        <p style={{ color: "orange", fontWeight: "bold" }}>
          ⚠️ Acces permis doar administratorului.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>👤 Adaugă Utilizator Nou</h2>

        <input
          type="email"
          placeholder="Email utilizator"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
        >
          <option value="utilizator">Utilizator</option>
          <option value="ofertant">Ofertant</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" style={styles.button}>
          ➕ Adaugă Utilizator
        </button>
      </form>

      <footer style={styles.footer}></footer>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#f0f0f5",
    padding: "40px 20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
    marginBottom: "80px",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#001C40",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    background: "#F7931E",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  footer: {
    position: "absolute",
    bottom: "15px",
    fontSize: "12px",
    color: "#aaa",
  },
};

export default AdaugaUtilizator;
