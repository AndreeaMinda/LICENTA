// src/pages/EditeazaOferta.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditeazaOferta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oferta, setOferta] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/offers/${id}`)
      .then((res) => res.json())
      .then((data) => setOferta(data.oferta || data))
      .catch((err) => console.error("Eroare la preluarea ofertei:", err));
  }, [id]);

  const handleSave = () => {
    fetch(`http://localhost:3001/api/offers/${id}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(oferta),
    })
      .then((res) => {
        if (res.ok) {
          alert("✅ Ofertă actualizată cu succes!");
          navigate("/oferte-salvate");
        } else {
          alert("❌ Eroare la salvare ofertă.");
        }
      })
      .catch((err) => console.error("Eroare la salvare:", err));
  };

  if (!oferta) return <div>Se încarcă...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>📝 Editează Oferta #{oferta.nr_oferta}</h2>

      <label>Obiectiv:</label>
      <input
        type="text"
        value={oferta.obiectiv}
        onChange={(e) =>
          setOferta((prev) => ({ ...prev, obiectiv: e.target.value }))
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <label>Structura montaj:</label>
      <input
        type="text"
        value={oferta.structura}
        onChange={(e) =>
          setOferta((prev) => ({ ...prev, structura: e.target.value }))
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <label>Ofertant:</label>
      <input
        type="text"
        value={oferta.ofertant}
        onChange={(e) =>
          setOferta((prev) => ({ ...prev, ofertant: e.target.value }))
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <label>Data ofertă:</label>
      <input
        type="date"
        value={oferta.data?.substring(0, 10) || ""}
        onChange={(e) =>
          setOferta((prev) => ({ ...prev, data: e.target.value }))
        }
        style={{ width: "100%", marginBottom: "20px" }}
      />

      <button onClick={handleSave} style={{ padding: "10px 20px" }}>
        💾 Salvează modificările
      </button>
    </div>
  );
};

export default EditeazaOferta;
