import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    clienti: 0,
    devize: 0,
    oferte: 0,
    oferteAcceptate: 0,
  });

  const [programariSaptamana, setProgramariSaptamana] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const clienti = await fetch("http://localhost:3001/api/clients").then(
        (r) => r.json()
      );
      const devize = await fetch("http://localhost:3001/api/devize").then((r) =>
        r.json()
      );
      const oferte = await fetch("http://localhost:3001/api/offers").then((r) =>
        r.json()
      );
      const programari = await fetch(
        "http://localhost:3001/api/programari"
      ).then((r) => r.json());

      const oferteAcceptate = oferte.filter(
        (o) => o.status === "acceptata"
      ).length;

      setStats({
        clienti: clienti.length,
        devize: devize.length,
        oferte: oferte.length,
        oferteAcceptate,
      });

      // calculeaza saptamana curenta (luni - duminica)
      const azi = new Date();
      const startLuni = new Date(azi);
      startLuni.setDate(azi.getDate() - azi.getDay() + 1); // luni
      startLuni.setHours(0, 0, 0, 0);

      const endDuminica = new Date(startLuni);
      endDuminica.setDate(startLuni.getDate() + 6);
      endDuminica.setHours(23, 59, 59, 999);

      const saptamana = programari.filter((prog) => {
        const data = new Date(prog.data_programare);
        return data >= startLuni && data <= endDuminica;
      });

      setProgramariSaptamana(saptamana);
    };

    fetchStats();
  }, []);

  const formatDate = (dateStr) => {
    return dateStr?.split("T")[0] || "";
  };

  return (
    <div className="dashboard-container">
      <h2>👋 Bun venit în VoltPlan!</h2>
      <p className="subtitle">
        Gestionare completă pentru proiecte fotovoltaice
      </p>

      <div className="dashboard-grid">
        <Link to="/clienti" className="card">
          <h3>👤 Clienți</h3>
          <p>{stats.clienti} înregistrați</p>
        </Link>

        <Link to="/materiale" className="card">
          <h3>📦 Materiale</h3>
          <p>Gestionare completă</p>
        </Link>

        <Link to="/deviz" className="card">
          <h3>🧾 Deviz</h3>
          <p>{stats.devize} create</p>
        </Link>

        <Link to="/vizualizare-devize" className="card">
          <h3>📄 Devize salvate</h3>
          <p>Accesează proiecte</p>
        </Link>

        <Link to="/oferta-noua" className="card">
          <h3>📄 Ofertă nouă</h3>
          <p>Generează ofertă</p>
        </Link>

        <Link to="/oferte-salvate" className="card">
          <h3>📄 Oferte salvate</h3>
          <p>{stats.oferte} în total</p>
        </Link>

        <Link to="/necesar-materiale" className="card">
          <h3>📦 Necesar materiale</h3>
          <p>Pe baza ofertelor</p>
        </Link>

        <Link to="/programari" className="card">
          <h3>📅 Programări</h3>
          <p>{stats.oferteAcceptate} oferte acceptate</p>
        </Link>

        <Link to="/schimba-parola" className="card">
          <h3>🔒 Schimbare Parolă</h3>
          <p>Actualizează parola contului</p>
        </Link>

        <Link to="/adauga-utilizator" className="card">
          <h3>➕ Adaugă utilizator</h3>
          <p>Doar pentru admin</p>
        </Link>
      </div>

      <div className="recent-section">
        <h3>📅 Programările din săptămâna curentă</h3>
        {programariSaptamana.length === 0 ? (
          <p>Nu există lucrări programate în această săptămână.</p>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Proiect</th>
                <th>Data</th>
                <th>Status</th>
                <th>Durată</th>
              </tr>
            </thead>
            <tbody>
              {programariSaptamana.map((prog, idx) => (
                <tr key={idx}>
                  <td>{prog.client_name}</td>
                  <td>{prog.project_name}</td>
                  <td>{formatDate(prog.data_programare)}</td>
                  <td>{prog.status}</td>
                  <td>{prog.durata_zile || 1} zile</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
