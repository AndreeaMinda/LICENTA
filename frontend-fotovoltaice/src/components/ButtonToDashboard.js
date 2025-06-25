// src/components/ButtonToDashboard.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ButtonToDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/dashboard") return null;

  return (
    <button
      onClick={() => navigate("/dashboard")}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#ff6600",
        color: "#fff",
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      🏠 Dashboard
    </button>
  );
};

export default ButtonToDashboard;
