// Deviz.js complet pentru creare deviz NOU cu UI complet
import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from "react-select";
import "../fonts/timesnewroman-normal";
import { useParams } from "react-router-dom";

const Deviz = () => {
  const [clientType, setClientType] = useState("fizica");
  const [materials, setMaterials] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [extraServices, setExtraServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", price: "" });
  const tableRef = useRef();
  const { id } = useParams();
  const isClone = window.location.pathname.includes("/clone");
  const [tvaGeneral, setTvaGeneral] = useState(0.09);

  const predefinedServices = [
    "TRANSPORT",
    "DOSAR PROSUMATOR",
    "MANOPERA ELECTRIC",
    "MANOPERA MONTAJ",
    "MANOPERA IMPAMANTARE",
    "Alt serviciu personalizat",
  ];

  const tvaFizica = 0.09;
  const tvaJuridica = 0.19;

  const categoryMap = {
    Invertor: "invertor",
    Panou: "panou",
    Baterie: "baterie",
    "Smart Meter": "smart meter",
    Tablou: "tablou",
    Accesorii: "accesoriu",
    Structura: "suport",
    Cablu: "cablu",
    Clema: "clema",
    Tub: "tub",
    Surub: "surub",
    Impamantare: "impamantare",
    Diverse: "diverse",
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/materials")
      .then((res) => res.json())
      .then((data) => setMaterials(data));

    fetch("http://localhost:3001/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  useEffect(() => {
    if (id && materials.length > 0) {
      // 1. preluare proiect
      fetch(`http://localhost:3001/api/projects/${id}`)
        .then((res) => res.json())
        .then((project) => {
          if (!isClone) {
            setSelectedClientId(project.client_id);
            setProjectName(project.name);
          } else {
            setProjectName(project.name + " (copie)");
          }
        });

      // 2. preluare materiale din deviz
      fetch(`http://localhost:3001/api/deviz_items/${id}`)
        .then((res) => res.json())
        .then((items) => {
          const grouped = {};
          items.forEach((item) => {
            const mat = materials.find((m) => m.id === item.material_id);
            if (!mat) return;
            const label = Object.keys(categoryMap).find(
              (key) => categoryMap[key] === mat.type
            );
            if (!label) return;

            if (!grouped[label]) grouped[label] = [];
            grouped[label].push({
              id: mat.id,
              quantity: item.quantity,
            });
          });
          setSelectedItems(grouped);
        });
    }
  }, [id, materials]);

  const handleSaveDeviz = async () => {
    if (!selectedClientId || !projectName) {
      alert("Selectează un client și un nume de proiect.");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const totalFaraTVA = totalFinal.faraTVA.toFixed(2);
      const totalTVA = totalFinal.TVA.toFixed(2);
      const totalCuTVA = totalFinal.cuTVA.toFixed(2);
      const tvaRateText = clientType === "fizica" ? "9%" : "19%";

      const projectData = {
        client_id: selectedClientId,
        name: projectName,
        start_date: today,
        status: "nou",
        total: parseFloat(totalFaraTVA),
        tva: parseFloat(totalTVA),
        total_cu_tva: parseFloat(totalCuTVA),
        tva_rate: tvaRateText,
      };

      let projectId = id;

      //  MODIFICARE vs CREARE
      if (id && !isClone) {
        // actualizare proiect
        await fetch(`http://localhost:3001/api/projects/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        });

        // sterge vechile materiale
        await fetch(`http://localhost:3001/api/deviz_items/${id}`, {
          method: "DELETE",
        });
      } else {
        // creare proiect
        const res = await fetch("http://localhost:3001/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        });
        const result = await res.json();
        projectId = result.id;

        // dupa ce se creaza proiectul, se creaza un rand in tbela devize
        await fetch("http://localhost:3001/api/devize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId }),
        });
      }

      // Salveaza materialele
      const devizItems = allItems.map((item) => ({
        project_id: projectId,
        material_id: item.material_id,
        quantity: item.cantitate,
        unit_price: item.pretUnitar,
      }));

      await fetch("http://localhost:3001/api/deviz_items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(devizItems),
      });

      alert("✅ Deviz salvat cu succes!");
    } catch (err) {
      console.error("Eroare la salvare deviz:", err);
      alert("❌ Eroare la salvare.");
    }
  };

  const handleReactSelect = (selectedOption, category) => {
    if (!selectedOption) return;
    const id = selectedOption.value;
    setSelectedItems((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), { id, quantity: 1 }],
    }));
  };

  const handleQuantityChange = (category, index, quantity) => {
    const updated = [...selectedItems[category]];
    updated[index].quantity = quantity;
    setSelectedItems((prev) => ({ ...prev, [category]: updated }));
  };

  const handleRemoveItem = (category, index) => {
    const updated = [...selectedItems[category]];
    updated.splice(index, 1);
    setSelectedItems((prev) => ({ ...prev, [category]: updated }));
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) return;
    setExtraServices((prev) => [
      ...prev,
      { name: newService.name, price: parseFloat(newService.price) },
    ]);
    setNewService({ name: "", price: "" });
  };

  const handleRemoveService = (index) => {
    const updated = [...extraServices];
    updated.splice(index, 1);
    setExtraServices(updated);
  };

  const calculateItemTotal = (price, quantity, type) => {
    let tva = tvaGeneral;
    if (type === "baterie" || type === "impamantare") {
      tva = 0.19;
    }

    const totalFaraTVA = price * quantity;
    const totalCuTVA = totalFaraTVA * (1 + tva);
    return { totalFaraTVA, totalCuTVA, TVA: totalCuTVA - totalFaraTVA };
  };

  const allItems = Object.entries(selectedItems).flatMap(([cat, items]) =>
    items.map(({ id, quantity }) => {
      const mat = materials.find((m) => m.id === id);
      const total = calculateItemTotal(
        parseFloat(mat.price),
        quantity,
        mat.type
      );
      return {
        categorie: cat,
        denumire: mat.name,
        um: mat.unit,
        cantitate: quantity,
        pretUnitar: parseFloat(mat.price),
        material_id: mat.id,
        ...total,
      };
    })
  );

  const serviceItems = extraServices.map((s) => {
    let tva = tvaGeneral;
    if (s.name.toLowerCase().includes("impamantare")) {
      tva = 0.19;
    }

    const totalFaraTVA = parseFloat(s.price);
    const totalCuTVA = totalFaraTVA * (1 + tva);
    const tvaValoare = totalCuTVA - totalFaraTVA;

    return {
      categorie: "Serviciu",
      denumire: s.name,
      um: "-",
      cantitate: 1,
      pretUnitar: s.price,
      totalFaraTVA,
      TVA: tvaValoare,
      totalCuTVA,
    };
  });

  const totalFinal = [...allItems, ...serviceItems].reduce(
    (acc, item) => {
      acc.faraTVA += item.totalFaraTVA;
      acc.TVA += item.TVA;
      acc.cuTVA += item.totalCuTVA;
      return acc;
    },
    { faraTVA: 0, TVA: 0, cuTVA: 0 }
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.text("Deviz materiale sistem fotovoltaic", 14, 15);
    doc.text(
      `Client: ${clients.find((c) => c.id == selectedClientId)?.name || "-"}`,
      14,
      22
    );
    doc.text(`Proiect: ${projectName || "-"}`, 14, 29);

    const rows = [...allItems, ...serviceItems].map((item) => [
      item.categorie,
      item.denumire,
      item.um,
      item.cantitate,
      item.pretUnitar.toFixed(2),
      item.totalFaraTVA.toFixed(2),
      item.TVA.toFixed(2),
      item.totalCuTVA.toFixed(2),
    ]);

    doc.autoTable({
      startY: 35,
      head: [
        [
          "Categorie",
          "Denumire",
          "UM",
          "Cant.",
          "Pret unitar",
          "Total fara TVA",
          "TVA",
          "Total cu TVA",
        ],
      ],
      body: rows,
      styles: { fontSize: 10, font: "times" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    const y = doc.lastAutoTable.finalY || 50;
    doc.text(
      `Total fără TVA: ${totalFinal.faraTVA.toFixed(2)} RON`,
      14,
      y + 10
    );
    doc.text(`TVA: ${totalFinal.TVA.toFixed(2)} RON`, 14, y + 17);
    doc.text(`Total cu TVA: ${totalFinal.cuTVA.toFixed(2)} RON`, 14, y + 24);

    // pentru paginare
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("DejaVuSans", "normal");
      doc.setFontSize(10);
      doc.text(
        `Pagina ${i} / ${pageCount}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    doc.save("deviz_fotovoltaic.pdf");
  };

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: "Deviz Printat",
    contentRef: tableRef, //
  });

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* partea stanga */}
      <div style={{ flex: 1 }}>
        <h2>Deviz Sistem Fotovoltaic</h2>

        <label>Client: </label>
        <select
          value={selectedClientId || ""}
          onChange={(e) => setSelectedClientId(e.target.value)}
        >
          <option value="">-- Selectează client --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <label>Denumire proiect: </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Ex: Instalare 5kW - Timișoara"
        />

        <br />
        <br />

        <label>TVA general:</label>
        <select
          value={tvaGeneral}
          onChange={(e) => setTvaGeneral(parseFloat(e.target.value))}
          style={{ marginLeft: "10px" }}
        >
          <option value={0.09}>TVA 9%</option>
          <option value={0.19}>TVA 19%</option>
        </select>

        <br />
        <br />

        <h3>Servicii suplimentare</h3>
        <select
          value={newService.name}
          onChange={(e) =>
            setNewService((prev) => ({ ...prev, name: e.target.value }))
          }
        >
          <option value="">-- Alege serviciu --</option>
          {predefinedServices.map((srv, i) => (
            <option key={i} value={srv}>
              {srv}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Preț (RON)"
          value={newService.price}
          onChange={(e) =>
            setNewService((prev) => ({ ...prev, price: e.target.value }))
          }
          style={{ marginLeft: "10px", width: "100px" }}
        />
        <button onClick={handleAddService} style={{ marginLeft: "10px" }}>
          ➕ Adaugă
        </button>

        <ul>
          {extraServices.map((srv, index) => (
            <li key={index}>
              {srv.name} – {parseFloat(srv.price).toFixed(2)} RON
              <button
                onClick={() => handleRemoveService(index)}
                style={{ marginLeft: "10px" }}
              >
                ❌
              </button>
            </li>
          ))}
        </ul>

        <hr />
        <h3>Adăugare materiale</h3>

        {Object.entries(categoryMap).map(([label, type]) => {
          const options = materials
            .filter((mat) => mat.type === type)
            .map((mat) => ({
              value: mat.id,
              label: `${mat.name} (${parseFloat(mat.price).toFixed(2)} RON)`,
            }));

          const selected = selectedItems[label] || [];

          return (
            <div key={label} style={{ marginBottom: "10px" }}>
              <h4>{label}</h4>
              <Select
                options={options}
                onChange={(option) => handleReactSelect(option, label)}
                placeholder="Caută material..."
                isClearable
              />
              {selected.map((item, index) => {
                const mat = materials.find((m) => m.id === item.id);
                if (!mat) return null;
                const total = calculateItemTotal(
                  parseFloat(mat.price),
                  item.quantity,
                  mat.type
                );

                return (
                  <div key={index}>
                    <strong>{mat.name}</strong> —
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          label,
                          index,
                          parseFloat(e.target.value)
                        )
                      }
                      style={{ width: "60px", margin: "0 10px" }}
                    />
                    x {parseFloat(mat.price).toFixed(2)} RON ={" "}
                    {total.totalFaraTVA.toFixed(2)} RON fără TVA
                    <button
                      onClick={() => handleRemoveItem(label, index)}
                      style={{ marginLeft: "10px" }}
                    >
                      ❌
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* partea dreapta - A4 */}
      <div style={{ flex: 1 }}>
        <div
          ref={tableRef}
          className="print-area"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "20mm",
            background: "#fff",
            fontFamily: "Times New Roman, serif",
            fontSize: "12pt",
            color: "#000",
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
          }}
        >
          <h3 style={{ textAlign: "center" }}>
            Deviz materiale sistem fotovoltaic
          </h3>
          <table border="1" width="100%" cellPadding="6">
            <thead>
              <tr>
                <th>Categorie</th>
                <th>Denumire</th>
                <th>UM</th>
                <th>Cant.</th>
                <th>Preț unitar</th>
                <th>Total fără TVA</th>
                <th>TVA</th>
                <th>Total cu TVA</th>
              </tr>
            </thead>
            <tbody>
              {[...allItems, ...serviceItems].map((item, index) => (
                <tr key={index}>
                  <td>{item.categorie}</td>
                  <td>{item.denumire}</td>
                  <td>{item.um}</td>
                  <td>{item.cantitate}</td>
                  <td>{item.pretUnitar.toFixed(2)}</td>
                  <td>{item.totalFaraTVA.toFixed(2)}</td>
                  <td>{item.TVA.toFixed(2)}</td>
                  <td>{item.totalCuTVA.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <p>
              <strong>Total fără TVA:</strong> {totalFinal.faraTVA.toFixed(2)}{" "}
              RON
            </p>
            <p>
              <strong>TVA:</strong> {totalFinal.TVA.toFixed(2)} RON
            </p>
            <p>
              <strong>Total cu TVA:</strong> {totalFinal.cuTVA.toFixed(2)} RON
            </p>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button onClick={handleSaveDeviz}>💾 Salvează deviz</button>
          <button onClick={handlePrint} style={{ marginLeft: "10px" }}>
            🖨️ Printează
          </button>
          <button onClick={exportPDF} style={{ marginLeft: "10px" }}>
            📄 Exportă PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deviz;
