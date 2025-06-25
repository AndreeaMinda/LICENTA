import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("❌ Parolele nu coincid.");
      return;
    }

    const res = await fetch(
      `http://localhost:3001/api/reset-password/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }
    );

    const data = await res.json();
    setMessage(data.message);

    if (res.ok) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <div style={styles.logo}>⚡ VoltPlan</div>
        <p style={styles.subtitle}>
          Platformă pentru gestionarea ofertelor solare
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>🔁 Resetare parolă</h2>

        {message && <p style={styles.message}>{message}</p>}

        <input
          type="password"
          placeholder="Parolă nouă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirmare parolă"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.resetBtn}>
          🔄 Resetează
        </button>

        <a href="/login" style={styles.backLink}>
          ← Înapoi la autentificare
        </a>
      </form>

      <footer style={styles.footer}>© 2025 VoltPlan</footer>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f0f0f5",
    minHeight: "100vh",
    paddingTop: "60px",
    position: "relative",
  },
  top: {
    textAlign: "center",
    marginBottom: "20px",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#F7931E",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginTop: "4px",
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
  resetBtn: {
    width: "100%",
    background: "#F7931E",
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
    color: "#F7931E",
    textDecoration: "none",
  },
  footer: {
    position: "absolute",
    bottom: "15px",
    fontSize: "12px",
    color: "#aaa",
  },
};

export default ResetPassword;
