import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const NecesarMateriale = () => {
  const [materiale, setMateriale] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/materiale-necesar")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMateriale(data);
        }
      })
      .catch((err) => console.error("Eroare la preluare:", err));
  }, []);

  const materialeFiltrate = materiale.filter((m) =>
    (m.name + m.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grupate = {
    Invertoare: materialeFiltrate.filter((m) => m.type === "invertor"),
    Panouri: materialeFiltrate.filter((m) => m.type === "panou"),
    Baterii: materialeFiltrate.filter((m) => m.type === "baterie"),
    "Alte materiale": materialeFiltrate.filter(
      (m) => !["invertor", "panou", "baterie"].includes(m.type)
    ),
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Necesar materiale din oferte acceptate", 14, 15);

    let finalY = 25;
    Object.entries(grupate).forEach(([titlu, lista]) => {
      if (lista.length > 0) {
        doc.setFontSize(12);
        doc.text(titlu, 14, finalY);
        finalY += 6;
        doc.autoTable({
          startY: finalY,
          head: [["#", "Material", "Tip", "Total", "Unitate"]],
          body: lista.map((mat, i) => [
            i + 1,
            mat.name,
            mat.type,
            mat.total_cantitate,
            mat.unit,
          ]),
          theme: "grid",
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
          didDrawPage: (data) => {
            const pageNumber = doc.internal.getNumberOfPages();
            doc.text(
              `Pagina ${pageNumber}`,
              doc.internal.pageSize.getWidth() - 40,
              doc.internal.pageSize.getHeight() - 10
            );
          },
        });
        finalY = doc.lastAutoTable.finalY + 10;
      }
    });

    doc.save("necesar-materiale.pdf");
  };

  const exportToExcel = () => {
    const toateMaterialele = Object.entries(grupate).flatMap(([titlu, lista]) =>
      lista.map((mat, i) => ({
        Nr: i + 1,
        Grup: titlu,
        Material: mat.name,
        Tip: mat.type,
        Total: mat.total_cantitate,
        Unitate: mat.unit,
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(toateMaterialele);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Necesar Materiale");

    XLSX.writeFile(workbook, "necesar-materiale.xlsx");
  };

  const renderGrup = (grup, titlu, startIndex) => {
    return [
      <tr key={`grup-${titlu}`}>
        <td
          colSpan="5"
          style={{
            backgroundColor: "#e9ecef",
            fontWeight: "bold",
            padding: "10px",
          }}
        >
          {titlu}
        </td>
      </tr>,
      ...grup.map((mat, i) => (
        <tr key={`${titlu}-${i}`}>
          <td style={cellStyle}>{startIndex + i + 1}</td>
          <td style={cellStyle}>{mat.name}</td>
          <td style={cellStyle}>{mat.type}</td>
          <td style={cellStyle}>{mat.total_cantitate}</td>
          <td style={cellStyle}>{mat.unit}</td>
        </tr>
      )),
    ];
  };

  let indexGlobal = 0;

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Necesar materiale din oferte acceptate</h2>

      <input
        type="text"
        placeholder="🔍 Caută material sau tip..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={exportToPDF}
          style={{
            padding: "10px 20px",
            backgroundColor: "#FFA500",
            border: "none",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📄 Exportă PDF
        </button>

        <button
          onClick={exportToExcel}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            border: "none",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📊 Exportă Excel
        </button>
      </div>

      {materialeFiltrate.length === 0 ? (
        <p>Nu există materiale din oferte acceptate.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#002244", color: "white" }}>
              <th style={headerStyle}>#</th>
              <th style={headerStyle}>Material</th>
              <th style={headerStyle}>Tip</th>
              <th style={headerStyle}>Total</th>
              <th style={headerStyle}>Unitate</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grupate).map(([titlu, lista]) => {
              const rows = renderGrup(lista, titlu, indexGlobal);
              indexGlobal += lista.length;
              return rows;
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const headerStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const cellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  verticalAlign: "middle",
};

export default NecesarMateriale;
