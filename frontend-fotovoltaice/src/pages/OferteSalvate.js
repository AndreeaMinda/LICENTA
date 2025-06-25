import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OferteSalvate = () => {
  const [oferte, setOferte] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/api/offers")
      .then((res) => res.json())
      .then((data) => {
        // sortare descrescat. dupa dat
        const sorted = data.sort((a, b) => new Date(b.data) - new Date(a.data));
        setOferte(sorted);
      })
      .catch((err) => console.error("Eroare la oferte:", err));
  }, []);

  const handleVizualizeaza = (oferta) => {
    navigate(`/vizualizare-oferta/${oferta.id}`);
  };

  const handleSterge = async (id) => {
    if (window.confirm("Sigur dorești să ștergi această ofertă?")) {
      const res = await fetch(`http://localhost:3001/api/offers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("✨ Ofertă ștearsă");
        setOferte(oferte.filter((o) => o.id !== id));
      }
    }
  };

  const handleStatusChange = async (id, nouStatus) => {
    const confirmare = window.confirm(
      `Ești sigur că vrei să schimbi statusul în "${nouStatus}"?`
    );
    if (!confirmare) return;

    const body = { status: nouStatus };

    if (nouStatus === "acceptata") {
      const input = prompt("Câte zile durează lucrarea? (ex: 1, 2, 3)");
      const durataZile = parseInt(input);
      if (!isNaN(durataZile) && durataZile > 0) {
        body.durata_zile = durataZile;
      } else {
        alert("Valoare invalidă. Se va folosi 1 zi.");
        body.durata_zile = 1;
      }
    }

    const res = await fetch(`http://localhost:3001/api/offers/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const actualizate = oferte.map((o) =>
        o.id === id ? { ...o, status: nouStatus } : o
      );
      setOferte(actualizate);

      // 🔄 Actualizează statusul și în calendar, dacă e "in_curs" sau "finalizata"
      if (["in_curs", "finalizata"].includes(nouStatus)) {
        const oferta = oferte.find((o) => o.id === id);

        // Caută programarea asociată
        const progRes = await fetch("http://localhost:3001/api/programari");
        const programari = await progRes.json();

        const programare = programari.find(
          (p) =>
            p.project_name === oferta.project_name &&
            p.client_name === oferta.client_name
        );

        if (programare) {
          await fetch(`http://localhost:3001/api/programari/${programare.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nouStatus }),
          });
        }
      }
    } else {
      alert("A apărut o eroare la actualizarea statusului.");
    }
  };

  const filteredOferte = oferte.filter((oferta) =>
    (oferta.client_name + " " + oferta.project_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "acceptata":
        return "#28a745"; // verde
      case "respinsa":
        return "#dc3545"; // rosu
      case "in_curs":
        return "#ffc107"; // galben
      case "finalizata":
        return "#17a2b8"; // albastru
      default:
        return "#6c757d"; // gri
    }
  };

  const handleSetDurata = async (ofertaId, zile) => {
    const confirmare = window.confirm(
      `Ești sigur că vrei să setezi durata la ${zile} zile? Această acțiune poate modifica programările.`
    );
    if (!confirmare) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/offers/${ofertaId}/durata`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durata_zile: zile }),
        }
      );

      if (res.ok) {
        const updated = oferte.map((o) =>
          o.id === ofertaId ? { ...o, durata_zile: zile } : o
        );
        setOferte(updated);
        alert("✅ Durata a fost actualizată cu succes.");
      } else {
        alert("❌ Eroare la actualizarea duratei.");
      }
    } catch (err) {
      console.error("Eroare durata:", err);
      alert("❌ Eroare de rețea.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Oferte Salvate</h2>

      <input
        type="text"
        placeholder="🔍 Caută după client sau proiect..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Client</th>
            <th>Proiect</th>
            <th>Data</th>
            <th>Durată</th>
            <th>Total</th>
            <th>Status</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {filteredOferte.map((oferta) => (
            <tr key={oferta.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{oferta.nr_oferta}</td>
              <td>{oferta.client_name}</td>
              <td>{oferta.project_name}</td>
              <td>{oferta.data?.substring(0, 10)}</td>
              <td>
                <select
                  value={oferta.durata_zile || 1}
                  onChange={(e) =>
                    handleSetDurata(oferta.id, parseInt(e.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5].map((z) => (
                    <option key={z} value={z}>
                      {z} zile
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {oferta.total_cu_tva ? (
                  <>
                    {parseFloat(oferta.total_fara_tva).toFixed(2)} RON fără TVA
                    <br />
                    <strong>
                      {parseFloat(oferta.total_cu_tva).toFixed(2)} RON cu TVA
                    </strong>
                  </>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <select
                  value={oferta.status || "in_asteptare"}
                  onChange={(e) =>
                    handleStatusChange(oferta.id, e.target.value)
                  }
                  style={{
                    padding: "6px",
                    borderRadius: "4px",
                    border: `1px solid ${getStatusColor(oferta.status)}`,
                    color: "#fff",
                    backgroundColor: getStatusColor(oferta.status),
                    fontWeight: "bold",
                  }}
                >
                  <option value="in_asteptare">În așteptare</option>
                  <option value="acceptata">Acceptată</option>
                  <option value="in_curs">În curs</option>
                  <option value="finalizata">Finalizată</option>
                  <option value="respinsa">Respinsă</option>
                </select>
              </td>
              <td>
                <button
                  onClick={() => handleVizualizeaza(oferta)}
                  style={{ marginRight: "10px" }}
                >
                  👁 Vizualizează
                </button>
                <button
                  onClick={() => handleSterge(oferta.id)}
                  style={{ marginRight: "10px" }}
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

export default OferteSalvate;
