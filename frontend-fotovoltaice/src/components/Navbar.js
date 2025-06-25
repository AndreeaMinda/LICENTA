import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("userRole") === "admin";

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <nav className="navbar-voltplan">
      <span className="navbar-title">🔋 VoltPlan</span>

      <Link to="/dashboard" className="nav-link">
        🏠 Tablou de bord
      </Link>
      <Link to="/clienti" className="nav-link">
        👤 Clienți
      </Link>
      <Link to="/materiale" className="nav-link">
        📦 Materiale
      </Link>
      <Link to="/deviz" className="nav-link">
        🧾 Deviz
      </Link>
      <Link to="/vizualizare-devize" className="nav-link">
        📄 Devize salvate
      </Link>
      <Link to="/oferta" className="nav-link">
        📄 Ofertă nouă
      </Link>
      <Link to="/oferte-salvate" className="nav-link">
        📄 Oferte salvate
      </Link>
      <Link to="/necesar-materiale" className="nav-link">
        📦 Necesar materiale
      </Link>
      <Link to="/programari" className="nav-link">
        📅 Programări
      </Link>
      <li>
        <Link to="/schimba-parola">🔒 Schimbă Parola</Link>
      </li>

      {isAdmin && (
        <Link to="/adauga-utilizator" className="nav-link">
          ➕ Adaugă utilizator
        </Link>
      )}

      <button onClick={handleLogout} className="logout-button">
        🔒 Logout
      </button>
    </nav>
  );
};

export default Navbar;
