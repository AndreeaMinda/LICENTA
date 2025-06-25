import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3001/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>🔐 Resetare parolă</h2>

        {message && <p style={styles.message}>{message}</p>}

        <input
          type="email"
          placeholder="Emailul tău"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.sendBtn}>
          📩 Trimite link
        </button>

        <a href="/login" style={styles.backLink}>
          ← Înapoi la autentificare
        </a>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    height: "90vh",
    paddingTop: "60px",
    backgroundColor: "#f0f0f5",
  },
  form: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
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
  sendBtn: {
    width: "100%",
    background: "#ff6600", // portocaliu solar
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  message: {
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: "10px",
  },
  backLink: {
    display: "block",
    textAlign: "center",
    marginTop: "10px",
    color: "#ff6600",
    textDecoration: "none",
  },
};

export default ForgotPassword;
