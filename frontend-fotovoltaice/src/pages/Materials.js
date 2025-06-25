import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    type: "",
    unit: "",
    supplier: "",
    price: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const focusId = queryParams.get("id")
    ? parseInt(queryParams.get("id"))
    : null;

  const refs = useRef({});
  const backTo = queryParams.get("backTo");

  useEffect(() => {
    fetchMaterials();
  }, [focusId, itemsPerPage]);

  useEffect(() => {
    if (focusId && materials.length > 0) {
      const materialGasit = materials.find((m) => m.id === focusId);
      if (materialGasit) {
        setSearchTerm(materialGasit.name); // 🔎 filtreaza automat
        setFormData({ ...materialGasit });
        setIsEditing(true);
        setCurrentPage(1);
      }
    }
  }, [materials, focusId]);

  useEffect(() => {
    if (focusId && refs.current[focusId]) {
      setTimeout(() => {
        refs.current[focusId].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        //  curatare URL
        const newUrl = window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      }, 300);
    }
  }, [searchTerm]);

  const fetchMaterials = async () => {
    const res = await fetch("http://localhost:3001/api/materials");
    const data = await res.json();
    setMaterials(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const { name, type, unit, supplier, price } = formData;
    if (!name || !type || !unit || !supplier || !price)
      return alert("Completează toate câmpurile!");
    await fetch("http://localhost:3001/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    resetForm();
    fetchMaterials();
    showMessage("✅ Material adăugat cu succes!");
  };

  const handleEditClick = (material) => {
    setFormData({ ...material });
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    const { id, name, type, unit, supplier, price } = formData;
    if (!id || !name || !type || !unit || !supplier || !price)
      return alert("Completează toate câmpurile!");
    await fetch(`http://localhost:3001/api/materials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    resetForm();
    fetchMaterials();
    showMessage("✅ Material salvat cu succes!");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ștergi materialul?")) {
      await fetch(`http://localhost:3001/api/materials/${id}`, {
        method: "DELETE",
      });
      fetchMaterials();
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      type: "",
      unit: "",
      supplier: "",
      price: "",
    });
    setIsEditing(false);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredMaterials = materials.filter((mat) =>
    mat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    const fieldA = a[sortField].toString().toLowerCase();
    const fieldB = b[sortField].toString().toLowerCase();
    if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaterials = sortedMaterials.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  return (
    <div style={{ maxWidth: "1200px", margin: "auto" }}>
      <h2>Materiale Fotovoltaice</h2>

      {backTo === "oferta" && (
        <button
          onClick={() => window.history.back()}
          style={{
            marginBottom: "20px",
            backgroundColor: "#eee",
            border: "1px solid #ccc",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          ↩ Înapoi la ofertă
        </button>
      )}

      {message && (
        <div style={{ marginBottom: "10px", color: "green" }}>{message}</div>
      )}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          name="name"
          placeholder="Denumire"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          name="type"
          placeholder="Tip"
          value={formData.type}
          onChange={handleChange}
        />
        <input
          name="unit"
          placeholder="Unitate"
          value={formData.unit}
          onChange={handleChange}
        />
        <input
          name="supplier"
          placeholder="Furnizor"
          value={formData.supplier}
          onChange={handleChange}
        />
        <input
          name="price"
          type="number"
          placeholder="Preț"
          value={formData.price}
          onChange={handleChange}
        />
        {isEditing ? (
          <>
            <button onClick={handleUpdate}>💾 Salvează</button>
            <button onClick={resetForm}>✖ Anulează</button>
          </>
        ) : (
          <button onClick={handleAdd}>➕ Adaugă</button>
        )}
      </div>

      <input
        type="text"
        placeholder="🔍 Caută după denumire..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "10px", width: "100%", padding: "6px" }}
      />
      <button onClick={resetSearch} style={{ marginBottom: "20px" }}>
        🔄 Resetează căutarea
      </button>

      <div style={{ marginBottom: "10px" }}>
        <label>Afișează: </label>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span> materiale / pagină</span>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Sortează după:</strong>
        <button onClick={() => toggleSort("name")}>Denumire</button>
        <button onClick={() => toggleSort("type")}>Tip</button>
        <button onClick={() => toggleSort("supplier")}>Furnizor</button>
        <button onClick={() => toggleSort("price")}>Preț</button>
      </div>

      {filteredMaterials.length === 0 ? (
        <p>⚠️ Nu s-au găsit materiale.</p>
      ) : (
        <>
          <table border="1" width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Denumire</th>
                <th>Tip</th>
                <th>Unitate</th>
                <th>Furnizor</th>
                <th>Preț</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {currentMaterials.map((mat) => (
                <tr
                  key={mat.id}
                  ref={(el) => (refs.current[mat.id] = el)}
                  style={{
                    backgroundColor: mat.id === focusId ? "#fff9c4" : "white",
                  }}
                >
                  <td>{mat.name}</td>
                  <td>{mat.type}</td>
                  <td>{mat.unit}</td>
                  <td>{mat.supplier}</td>
                  <td>{parseFloat(mat.price).toFixed(2)} RON</td>
                  <td>
                    <button onClick={() => handleEditClick(mat)}>✒️</button>
                    <button onClick={() => handleDelete(mat.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ◀ Anterior
            </button>
            <span>
              Pagina {currentPage} din {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Următor ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Materials;
