import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || "Eroare necunoscută.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userRole", data.role);
      navigate("/dashboard");
    } catch (err) {
      setError("Conexiune eșuată la server.");
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
        <h2 style={styles.title}>🔒 Autentificare</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Parolă"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.toggleBtn}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button type="submit" style={styles.loginBtn}>
          Autentificare
        </button>

        <a href="/forgot-password" style={styles.forgotLink}>
          Ai uitat parola?
        </a>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f0f0f5",
  },
  page: {
    flex: 1, // pune footerul jos
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "60px",
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
    marginBottom: "40px",
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
  loginBtn: {
    width: "100%",
    background: "#F7931E",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    textAlign: "center",
  },
  forgotLink: {
    display: "block",
    textAlign: "center",
    marginTop: "10px",
    color: "#007bff",
    textDecoration: "none",
  },
  passwordContainer: {
    position: "relative",
  },
  toggleBtn: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Login;
