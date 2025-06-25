import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VizualizareDevize = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }); // ex: 16.06.2025
  };

  useEffect(() => {
    // preluare clienti
    fetch("http://localhost:3001/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data));

    // preluare proiecte
    fetch("http://localhost:3001/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "-";
  };

  const filteredProjects = projects.filter((p) => {
    const clientName = getClientName(p.client_id).toLowerCase();
    return (
      clientName.includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (projectId) => {
    const confirm = window.confirm("Sigur dorești să ștergi acest deviz?");
    if (!confirm) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        alert("Eroare la ștergerea devizului.");
      }
    } catch (err) {
      alert("Eroare de rețea.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📂 Devize Salvate</h2>

      <input
        type="text"
        placeholder="🔍 Caută după client sau proiect..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "8px",
          width: "300px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>ID</th>
            <th>Client</th>
            <th>Proiect</th>
            <th>Data</th>
            <th>Total fără TVA</th>
            <th>TVA (%)</th>
            <th>Total cu TVA</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((proj) => (
            <tr key={proj.id}>
              <td>{proj.id}</td>
              <td>{getClientName(proj.client_id)}</td>
              <td>{proj.name}</td>
              <td>{formatDate(proj.start_date)}</td>
              <td>
                {proj.total ? parseFloat(proj.total).toFixed(2) + " RON" : "-"}
              </td>
              <td>{proj.tva_rate || "-"}</td>
              <td>
                {proj.total_cu_tva
                  ? parseFloat(proj.total_cu_tva).toFixed(2) + " RON"
                  : "-"}
              </td>
              <td>
                <button
                  onClick={() => navigate(`/deviz/${proj.id}`)}
                  style={{ marginRight: "10px" }}
                >
                  ✏️ Modifică
                </button>
                <button onClick={() => navigate(`/deviz/${proj.id}/clone`)}>
                  📄 Clonează
                </button>
                <button
                  onClick={() => handleDelete(proj.id)}
                  style={{
                    color: "white",
                    marginLeft: "10px",
                  }}
                >
                  ❌ Șterge
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VizualizareDevize;
