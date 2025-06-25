import React, { useState } from "react";

const SchimbareParola = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("userEmail");

  const validatePassword = (pass) => {
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("❌ Parolele nu coincid.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage(
        "❌ Parola trebuie să aibă minim 8 caractere, o literă mare, o cifră și un simbol."
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Parola a fost schimbată cu succes.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage("❌ " + data.message);
      }
    } catch {
      setMessage("❌ Eroare la conexiune.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>🔒 Schimbare Parolă</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Parola veche"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Parolă nouă"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirmă parola"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            💾 Salvează
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#f5f8fa",
    padding: "40px 20px",
    flex: 1, // necesar pentru layout
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  container: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "100%",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    color: "#001C40",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
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
  message: {
    marginTop: "10px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
};

export default SchimbareParola;
