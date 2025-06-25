import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VizualizareOferta = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [oferta, setOferta] = useState(null);
  const [articole, setArticole] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalFaraTVA, setTotalFaraTVA] = useState(0);
  const [valoareTVA, setValoareTVA] = useState(0);
  const [totalCuTVA, setTotalCuTVA] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:3001/api/offers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOferta(data.oferta);
        setArticole(data.articole);
        setTotalFaraTVA(
          data.oferta.total ? parseFloat(data.oferta.total).toFixed(2) : "0.00"
        );
        setValoareTVA(
          data.oferta.tva ? parseFloat(data.oferta.tva).toFixed(2) : "0.00"
        );
        setTotalCuTVA(
          data.oferta.total_cu_tva
            ? parseFloat(data.oferta.total_cu_tva).toFixed(2)
            : "0.00"
        );

        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la încărcare ofertă:", err);
        setLoading(false);
      });
  }, [id]);
  const handleRedirectToMaterial = (id) => {
    navigate(`/materiale?id=${id}`);
  };

  if (loading) return <p>Se încarcă oferta...</p>;
  if (!oferta) return <p>Oferta nu a fost găsită.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vizualizare Ofertă #{oferta.id}</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 60%", minWidth: "300px" }}>
          <p>
            <strong>Client:</strong> {oferta.client_name} ({oferta.client_email}
            , {oferta.client_phone})
          </p>
          <p>
            <strong>Localitate:</strong> {oferta.client_localitate},{" "}
            {oferta.client_judet}
          </p>
          <p>
            <strong>Proiect:</strong> {oferta.project_name}
          </p>
          <p>
            <strong>Obiectiv:</strong> {oferta.obiectiv}
          </p>
          <p>
            <strong>Structura montaj:</strong> {oferta.structura}
          </p>
          <p>
            <strong>Ofertant:</strong> {oferta.ofertant}
          </p>
          <p>
            <strong>Data ofertă:</strong>{" "}
            {new Date(oferta.data_oferta).toLocaleDateString()}
          </p>
        </div>

        <div
          style={{
            textAlign: "right",
            backgroundColor: "#f9f9f9",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            maxWidth: "350px",
            alignSelf: "center",
            marginTop: "10px",
            flex: "1 1 35%",
            minWidth: "280px",
          }}
        >
          <p>
            <strong>Total fără TVA:</strong> {totalFaraTVA} lei
          </p>
          <p>
            <strong>Total TVA:</strong> {valoareTVA} lei
          </p>
          <p>
            <strong>Total cu TVA:</strong> {totalCuTVA} lei
          </p>
        </div>
      </div>

      <h3 style={{ marginTop: "30px" }}>Articole incluse</h3>
      <table
        border="1"
        cellPadding="6"
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <thead>
          <tr>
            <th>Denumire</th>
            <th>Cantitate</th>
            <th>UM</th>
            <th>Preț unitar</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {articole.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>
                {item.price !== null && !isNaN(item.price)
                  ? `${parseFloat(item.price).toFixed(2)} lei`
                  : "—"}
              </td>
              <td>
                <button
                  onClick={() => handleRedirectToMaterial(item.material_id)}
                  style={{
                    padding: "4px 8px",
                    cursor: "pointer",
                    backgroundColor: "#FFA500",
                    border: "none",
                    borderRadius: "4px",
                    color: "white",
                    transition: "background-color 0.2s ease-in-out",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#e69500")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#FFA500")
                  }
                >
                  ✏️ Modifică
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VizualizareOferta;
