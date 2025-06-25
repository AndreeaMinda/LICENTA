// OfertaNoua.js
import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useReactToPrint } from "react-to-print";
import "../fonts/timesnewroman-normal";
import "../fonts/DejaVuSans-normal";
import Select from "react-select";

const OfertaNoua = () => {
  const [devize, setDevize] = useState([]);
  const [selectedDevizId, setSelectedDevizId] = useState(null);
  const [devizItems, setDevizItems] = useState([]);
  const [client, setClient] = useState({});
  const [showItems, setShowItems] = useState({});
  const [obiectiv, setObiectiv] = useState("Sistem fotovoltaic complet");
  const [structura, setStructura] = useState("");
  const [ofertant, setOfertant] = useState("");
  const [nrOferta, setNrOferta] = useState("OF-1");
  const printRef = useRef(null);

  const [includeCabluri, setIncludeCabluri] = useState(false);
  const [cabluSolar, setCabluSolar] = useState("6");
  const [conductorGV, setConductorGV] = useState("16");
  const [cabluAC, setCabluAC] = useState("3x6");

  const [total, setTotal] = useState("");
  const [TVA, setTVA] = useState("");
  const [totalCuTVA, setTotalCuTVA] = useState("");
  const [tvaRate, setTvaRate] = useState("");

  const [articoleSuplimentare, setArticoleSuplimentare] = useState({
    "Smart Meter + Wi-Fi": false,
    "Tablou AC/DC complet echipat": false,
    "Transport + manipulare module, invertor și structură": false,
    "Manoperă instalare": false,
    "Punere în funcțiune": false,
    "Măsurători priză de pământ": false,
    "Documentație tehnică": false,
    "Dosar prosumator": false,
  });

  const loadNextNrOferta = () => {
    fetch("http://localhost:3001/api/offers")
      .then((res) => res.json())
      .then((data) => {
        const numere = data
          .map((o) => parseInt(o.nr_oferta?.split("-")[1]))
          .filter((n) => !isNaN(n));
        const maxNr = numere.length > 0 ? Math.max(...numere) : 0;
        setNrOferta(`OF-${maxNr + 1}`);
      })
      .catch((err) => console.error("Eroare nr ofertă:", err));
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/devize")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Lista devize:", data);
        setDevize(data);
        loadNextNrOferta();
      });
  }, []);

  const calculeazaTotal = () => {
    let total = 0;

    devizItems.forEach((item) => {
      if (showItems[item.id]) {
        total += item.quantity * parseFloat(item.unit_price || 0);
      }
    });

    return total.toFixed(2);
  };

  const handleDevizSelect = async (id) => {
    if (!id) {
      console.warn("⚠️ Niciun deviz selectat.");
      return;
    }

    setSelectedDevizId(id);

    try {
      const res = await fetch(`http://localhost:3001/api/devize-by-id/${id}`);
      const data = await res.json();

      if (!res.ok || !data.client || !Array.isArray(data.items)) {
        console.error("⚠️ Date invalide din backend:", data);
        alert("Eroare la încărcarea devizului. Verifică baza de date.");
        return;
      }

      setClient(data.client);
      setDevizItems(data.items);
      setTotal(data.total);
      setTVA(data.tva);
      setTotalCuTVA(data.total_cu_tva);
      setTvaRate(data.tva_rate);

      const importantKeywords = ["invertor", "panou", "baterie"];
      const defaultShown = {};
      (data.items || []).forEach((item) => {
        const name = item.name.toLowerCase();
        defaultShown[item.id] = importantKeywords.some((kw) =>
          name.includes(kw)
        );
      });
      setShowItems(defaultShown);
    } catch (err) {
      console.error("❌ Eroare fetch deviz:", err);
      alert("A apărut o eroare la încărcarea devizului.");
    }
  };

  const handleSaveOffer = async () => {
    if (!selectedDevizId) {
      alert("Selectează un deviz înainte de a salva oferta.");
      return;
    }

    const payload = {
      deviz_id: selectedDevizId,
      nr_oferta: nrOferta,
      data: new Date().toISOString().slice(0, 10),
      obiectiv,
      structura,
      ofertant,
      total: parseFloat(totalCuTVA),
    };

    try {
      const checkRes = await fetch("http://localhost:3001/api/offers");
      const existingOffers = await checkRes.json();
      const existing = existingOffers.find(
        (o) => o.deviz_id === selectedDevizId
      );

      let res, data;

      if (existing) {
        res = await fetch(`http://localhost:3001/api/offers/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (res.ok) {
          alert("✅ Ofertă actualizată cu succes!");
        } else {
          alert("Eroare la actualizare ofertă: " + data.message);
        }
      } else {
        res = await fetch("http://localhost:3001/api/offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json();
        if (res.ok) {
          alert("✅ Ofertă salvată!");
          loadNextNrOferta();
        } else {
          alert("Eroare la salvarea ofertei: " + data.message);
        }
      }
    } catch (error) {
      console.error("Eroare salvare:", error);
      alert("Eroare la salvarea ofertei.");
    }
  };

  console.log("Deviz selectat:", selectedDevizId);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Ofertă ${nrOferta}`,
    contentRef: printRef,
  });

  const generatePDFBase64 = () => {
    const doc = new jsPDF();
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(12);

    doc.text("OFERTĂ COMERCIALĂ", 105, 20, { align: "center" });
    doc.text(`Număr ofertă: ${nrOferta}`, 14, 30);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 150, 30);
    doc.text(`Client: ${client?.nume || "-"}`, 14, 40);
    doc.text(
      `Adresa: ${client.localitate || "-"}, ${client.judet || "-"}`,
      14,
      46
    );
    doc.text(
      `Email: ${client.email || "-"} | Tel: ${client.telefon || "-"}`,
      14,
      52
    );
    doc.text(`Obiectiv: ${obiectiv}`, 14, 62);
    doc.text(`Structura: ${structura}`, 14, 68);
    doc.text(`Ofertant: ${ofertant}`, 14, 74);

    const body = [];

    devizItems.forEach((item) => {
      if (!showItems[item.id]) return;

      const name = item.name.toLowerCase();
      const isImportant =
        name.includes("invertor") ||
        name.includes("baterie") ||
        name.includes("panou") ||
        name.includes("panel") ||
        name.includes("solar");

      if (isImportant) {
        body.push([body.length + 1, "", item.name, item.quantity, item.unit]);
      } else {
        body.push([body.length + 1, "✔", `${item.name} (inclus)`, "", ""]);
      }
    });

    if (includeCabluri) {
      body.push([
        body.length + 1,
        "✔",
        `Cablu solar ${cabluSolar}mm, G/V ${conductorGV}mmp, AC ${cabluAC} (inclus)`,
        "",
        "",
      ]);
    }

    Object.entries(articoleSuplimentare).forEach(([label, checked]) => {
      if (checked) {
        body.push([body.length + 1, "✔", `${label} (inclus)`, "", ""]);
      }
    });

    doc.autoTable({
      startY: 80,
      head: [["Nr.", "✔", "Articol", "Cant.", "UM"]],
      body,
      styles: {
        font: "DejaVuSans",
        fontSize: 11,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        font: "DejaVuSans",
        fontStyle: "bold",
      },
      bodyStyles: {
        font: "DejaVuSans",
        fontStyle: "normal",
        textColor: 20,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { halign: "center", cellWidth: 10 },
      },
    });

    let total9 = 0,
      tva9 = 0;
    let total19 = 0,
      tva19 = 0;

    devizItems.forEach((item) => {
      if (!showItems[item.id]) return;

      const price = parseFloat(item.unit_price || 0);
      const quantity = parseFloat(item.quantity || 0);
      const type = (item.type || "").toLowerCase();

      const is19 =
        client.type === "juridica" ||
        ["baterie", "împământare", "impamantare"].includes(type);

      const tvaRate = is19 ? 0.19 : 0.09;
      const totalFaraTVA = price * quantity;
      const tvaVal = totalFaraTVA * tvaRate;

      if (tvaRate === 0.09) {
        total9 += totalFaraTVA;
        tva9 += tvaVal;
      } else {
        total19 += totalFaraTVA;
        tva19 += tvaVal;
      }
    });

    const grandTotal = total9 + total19 + tva9 + tva19;
    let currentY = doc.lastAutoTable.finalY + 12;

    doc.text("Rezumat costuri:", 14, currentY);
    currentY += 6;
    doc.text(
      `Total fără TVA: ${parseFloat(total).toFixed(2)} RON`,
      14,
      currentY
    );
    currentY += 6;
    doc.text(
      `TVA 9%: ${(parseFloat(total) * 0.09).toFixed(2)} RON, TVA 19%: ${(
        parseFloat(total) * 0.19
      ).toFixed(2)} RON`,
      14,
      currentY
    );
    currentY += 6;
    doc.text(
      `Total cu TVA: ${parseFloat(totalCuTVA).toFixed(2)} RON`,
      14,
      currentY
    );
    currentY += 10;

    doc.setFontSize(11);
    doc.text("Observații:", 14, currentY);
    currentY += 6;

    const observations = [
      "- Această ofertă este valabilă doar pentru configurația specificată. În cazul în care proiectul suferă modificări tehnice sau de cantități față de cele prezentate inițial, conținutul ofertei va fi revizuit corespunzător.",
      "- Orice ajustare ulterioară a ofertei va fi formalizată prin act adițional. Modificările solicitate de beneficiar după acceptarea ofertei vor necesita un document separat care să reflecte aceste schimbări.",
      "- Verificarea prizei de împământare existente se realizează la fața locului. În situația în care priza nu este conformă cu normativul I7-2011 sau nu poate fi identificată, realizarea unei noi prize de împământare va fi ofertată și tarifată separat.",
    ];

    observations.forEach((text) => {
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 14, currentY);
      currentY += lines.length * 6;
    });

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

    return doc.output("datauristring").split(",")[1];
  };

  const handleSendEmail = async () => {
    const pdfBase64 = generatePDFBase64();

    const confirm = window.confirm(
      `Trimiți oferta pe email către ${client.email}?`
    );
    if (!confirm) return;

    const res = await fetch("http://localhost:3001/api/send-offer-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: client.email,
        subject: `Oferta ${nrOferta} - VoltPlan`,
        text: `Stimată/Stimate ${client.nume},

Vă transmitem atașat oferta comercială cu numărul ${nrOferta}, elaborată în conformitate cu cerințele discutate anterior privind sistemul fotovoltaic propus.

Pentru orice întrebări, clarificări sau discuții suplimentare legate de ofertă, vă stăm cu plăcere la dispoziție telefonic sau prin email.

Vă mulțumim pentru interesul acordat soluțiilor noastre și așteptăm cu interes un feedback din partea dumneavoastră.

Cu respect,
${ofertant}
Consultant VoltPlan
📧 voltplan.adm@gmail.com
📞 07xx xxx xxx`,
        pdfBase64,
        nrOferta,
      }),
    });

    if (res.ok) {
      alert("✅ Ofertă trimisă pe email!");
    } else {
      alert("❌ Eroare la trimiterea ofertei pe email.");
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(12);

    // Titlu si date client
    doc.text("OFERTĂ COMERCIALĂ", 105, 20, { align: "center" });
    doc.text(`Număr ofertă: ${nrOferta}`, 14, 30);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 150, 30);
    doc.text(`Client: ${client.nume || "-"}`, 14, 40);
    doc.text(
      `Adresa: ${client.localitate || "-"}, ${client.judet || "-"}`,
      14,
      46
    );
    doc.text(
      `Email: ${client.email || "-"} | Tel: ${client.telefon || "-"}`,
      14,
      52
    );
    doc.text(`Obiectiv: ${obiectiv}`, 14, 62);
    doc.text(`Structura: ${structura}`, 14, 68);
    doc.text(`Ofertant: ${ofertant}`, 14, 74);

    // Tabel articole
    const body = [];

    devizItems.forEach((item) => {
      if (!showItems[item.id]) return;

      const name = item.name.toLowerCase();
      const isImportant =
        name.includes("invertor") ||
        name.includes("baterie") ||
        name.includes("panou") ||
        name.includes("panel") ||
        name.includes("solar");

      if (isImportant) {
        body.push([
          body.length + 1,
          "", // coloană bifa goală
          item.name,
          item.quantity,
          item.unit,
        ]);
      } else {
        body.push([
          body.length + 1,
          "✔", // bifa pentru articole incluse
          `${item.name} (inclus)`,
          "",
          "",
        ]);
      }
    });

    if (includeCabluri) {
      body.push([
        body.length + 1,
        "✔",
        `Cablu solar ${cabluSolar}mm, G/V ${conductorGV}mmp, AC ${cabluAC} (inclus)`,
        "",
        "",
      ]);
    }

    Object.entries(articoleSuplimentare).forEach(([label, checked]) => {
      if (checked) {
        body.push([body.length + 1, "✔", `${label} (inclus)`, "", ""]);
      }
    });

    // afisaj tabel
    doc.autoTable({
      startY: 80,
      head: [["Nr.", "✔", "Articol", "Cant.", "UM"]],
      body,
      styles: {
        font: "DejaVuSans",
        fontSize: 11,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        font: "DejaVuSans",
        fontStyle: "bold",
      },
      bodyStyles: {
        font: "DejaVuSans",
        fontStyle: "normal",
        textColor: 20,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 }, // Nr.
        1: { halign: "center", cellWidth: 10 }, // ✔
      },
    });

    // calcul tva diferentiait
    let total9 = 0,
      tva9 = 0;
    let total19 = 0,
      tva19 = 0;

    devizItems.forEach((item) => {
      if (!showItems[item.id]) return;

      const price = parseFloat(item.unit_price || 0);
      const quantity = parseFloat(item.quantity || 0);
      const type = (item.type || "").toLowerCase();

      const is19 =
        client.type === "juridica" ||
        ["baterie", "împământare", "impamantare"].includes(type);
      const tvaRate = is19 ? 0.19 : 0.09;

      const totalFaraTVA = price * quantity;
      const tvaVal = totalFaraTVA * tvaRate;

      if (tvaRate === 0.09) {
        total9 += totalFaraTVA;
        tva9 += tvaVal;
      } else {
        total19 += totalFaraTVA;
        tva19 += tvaVal;
      }
    });

    const grandTotal = total9 + total19 + tva9 + tva19;
    let currentY = doc.lastAutoTable.finalY + 12;
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(12);

    doc.text("Rezumat costuri:", 14, currentY);
    currentY += 6;

    doc.text(
      `Total fără TVA: ${parseFloat(total).toFixed(2)} RON`,
      14,
      currentY
    );
    currentY += 6;

    doc.text(
      `TVA 9%: ${(parseFloat(total) * 0.09).toFixed(2)} RON, TVA 19%: ${(
        parseFloat(total) * 0.19
      ).toFixed(2)} RON`,
      14,
      currentY
    );
    currentY += 6;

    doc.text(
      `Total cu TVA: ${parseFloat(totalCuTVA).toFixed(2)} RON`,
      14,
      currentY
    );
    currentY += 10;

    // obs pdf
    doc.setFontSize(11);
    doc.text("Observații:", 14, currentY);
    currentY += 6;

    const observations = [
      "- Această ofertă este valabilă doar pentru configurația specificată. În cazul în care proiectul suferă modificări tehnice sau de cantități față de cele prezentate inițial, conținutul ofertei va fi revizuit corespunzător.",
      "- Orice ajustare ulterioară a ofertei va fi formalizată prin act adițional. Modificările solicitate de beneficiar după acceptarea ofertei vor necesita un document separat care să reflecte aceste schimbări.",
      "- Verificarea prizei de împământare existente se realizează la fața locului. În situația în care priza nu este conformă cu normativul I7-2011 sau nu poate fi identificată, realizarea unei noi prize de împământare va fi ofertată și tarifată separat.",
    ];

    observations.forEach((text) => {
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 14, currentY);
      currentY += lines.length * 6;
    });

    // Numere pagini
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

    doc.save(`Oferta_${nrOferta}.pdf`);
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <div style={{ flex: 1 }}>
        <h2>Creare Ofertă Comercială</h2>

        <label style={{ display: "block", marginBottom: "5px" }}>Deviz:</label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <Select
            options={devize.map((d) => ({
              value: d.deviz_id,
              label: `${d.project_name} – ${d.client_name}`,
            }))}
            onChange={(selected) => {
              if (!selected) {
                setSelectedDevizId(null);
                setDevizItems([]);
                setClient({});
                console.log("⚠️ Deviz deselectat.");
                return;
              }

              console.log("✅ Deviz selectat:", selected.value);
              handleDevizSelect(selected.value);
            }}
            isClearable
          />

          <input
            value={obiectiv}
            onChange={(e) => setObiectiv(e.target.value)}
            placeholder="Obiectiv ofertă"
          />

          <input
            value={structura}
            onChange={(e) => setStructura(e.target.value)}
            placeholder="Structura montaj (ex: țiglă)"
          />

          <input
            value={ofertant}
            onChange={(e) => setOfertant(e.target.value)}
            placeholder="Ofertant (ex: Minda Andreea)"
          />
        </div>

        <h4>Cablu personalizat:</h4>
        <label>
          <input
            type="checkbox"
            checked={includeCabluri}
            onChange={() => setIncludeCabluri(!includeCabluri)}
          />
          &nbsp; Cablu solar {cabluSolar}mm, G/V {conductorGV}mmp, AC {cabluAC}
        </label>
        {includeCabluri && (
          <div>
            <input
              value={cabluSolar}
              onChange={(e) => setCabluSolar(e.target.value)}
              style={{ width: 50 }}
            />{" "}
            mm,
            <input
              value={conductorGV}
              onChange={(e) => setConductorGV(e.target.value)}
              style={{ width: 50, marginLeft: 10 }}
            />{" "}
            mmp,
            <input
              value={cabluAC}
              onChange={(e) => setCabluAC(e.target.value)}
              style={{ width: 70, marginLeft: 10 }}
            />
          </div>
        )}

        <h4>Servicii suplimentare:</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          {Object.entries(articoleSuplimentare).map(([label, checked]) => (
            <label key={label}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  setArticoleSuplimentare((prev) => ({
                    ...prev,
                    [label]: !prev[label],
                  }))
                }
              />{" "}
              {label}
            </label>
          ))}
        </div>

        <h4>Articole din deviz:</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {devizItems.map((item) => (
            <label key={item.id}>
              <input
                type="checkbox"
                checked={showItems[item.id] || false}
                onChange={() =>
                  setShowItems((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }
              />{" "}
              {item.name} – {item.quantity} {item.unit}
            </label>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <button onClick={handlePrint}>🖨️ Printează oferta</button>
          <button onClick={handleExportPDF} style={{ marginLeft: 10 }}>
            📄 Exportă PDF
          </button>
          <button onClick={handleSendEmail} style={{ marginLeft: 10 }}>
            ✉️ Trimite pe email
          </button>
          <button onClick={handleSaveOffer} style={{ marginLeft: 10 }}>
            💾 Salvează oferta
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div
          ref={printRef}
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
          <h2 style={{ textAlign: "center" }}>OFERTĂ COMERCIALĂ</h2>
          <p>
            <strong>Număr ofertă:</strong> {nrOferta}
          </p>
          {client && (
            <p>
              <strong>Client:</strong> {client.nume} – {client.localitate},{" "}
              {client.judet}
            </p>
          )}
          <p>
            <strong>Telefon:</strong> {client.telefon} | <strong>Email:</strong>{" "}
            {client.email}
          </p>
          <p>
            <strong>Data:</strong> {new Date().toLocaleDateString()}
          </p>
          <p>
            <strong>Obiectiv:</strong> {obiectiv}
          </p>
          <p>
            <strong>Structura montaj:</strong> {structura}
          </p>
          <p>
            <strong>Ofertant:</strong> {ofertant}
          </p>

          <h4 style={{ marginTop: 20 }}>Articole incluse:</h4>
          <ul>
            {devizItems
              .filter((i) => showItems[i.id])
              .map((item) => (
                <li key={item.id}>
                  {item.name} – {item.quantity} {item.unit}
                </li>
              ))}
            {includeCabluri && (
              <li>
                Cablu solar {cabluSolar}mm, conductor G/V {conductorGV}mmp,
                cablu AC {cabluAC}, elemente de conectică
              </li>
            )}
            {Object.entries(articoleSuplimentare)
              .filter(([, checked]) => checked)
              .map(([label], i) => (
                <li key={`supl-${i}`}>{label}</li>
              ))}
          </ul>

          <h4>Rezumat costuri:</h4>
          <p>
            <strong>Total fără TVA:</strong> {total} RON
          </p>
          <p>
            <em>
              (TVA 9%: {(parseFloat(total) * 0.09).toFixed(2)} RON, TVA 19%:{" "}
              {(parseFloat(total) * 0.19).toFixed(2)} RON)
            </em>
          </p>
          <p>
            <strong>Total cu TVA:</strong> {totalCuTVA} RON
          </p>

          <h4>Observații:</h4>
          <ul>
            <li>
              Această ofertă este valabilă doar pentru configurația specificată.
              În cazul în care proiectul suferă modificări tehnice sau de
              cantități față de cele prezentate inițial, conținutul ofertei va
              fi revizuit corespunzător.
            </li>
            <li>
              Orice ajustare ulterioară a ofertei va fi formalizată prin act
              adițional. Modificările solicitate de beneficiar după acceptarea
              ofertei vor necesita un document separat care să reflecte aceste
              schimbări.
            </li>
            <li>
              Verificarea prizei de împământare existente se realizează la fața
              locului. În situația în care priza nu este conformă cu normativul
              I7-2011 sau nu poate fi identificată, realizarea unei noi prize de
              împământare va fi ofertată și tarifată separat.
            </li>
          </ul>

          <p style={{ marginTop: 30 }}>
            Cu stimă,
            <br />
            {ofertant}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfertaNoua;
