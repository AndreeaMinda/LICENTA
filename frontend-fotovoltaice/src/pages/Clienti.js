// src/pages/Clienti.js
import React, { useEffect, useState } from "react";

const Clienti = () => {
  const [clienti, setClienti] = useState([]);
  const [search, setSearch] = useState("");
  const [judetFilter, setJudetFilter] = useState("");
  const [localitateFilter, setLocalitateFilter] = useState("");
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "fizica",
    judet: "",
    localitate: "",
  });

  const loadClienti = () => {
    const query = new URLSearchParams();
    if (judetFilter) query.append("judet", judetFilter);
    if (localitateFilter) query.append("localitate", localitateFilter);
    if (search) query.append("search", search);

    fetch(`http://localhost:3001/api/clients?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => setClienti(data));
  };

  useEffect(() => {
    loadClienti();
  }, [search, judetFilter, localitateFilter]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (client) => {
    setEditClient(client.id);
    setForm(client);
  };

  const handleDelete = (id) => {
    if (window.confirm("Sigur dorești să ștergi clientul?")) {
      fetch(`http://localhost:3001/api/clients/${id}`, {
        method: "DELETE",
      }).then(() => loadClienti());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editClient ? "PUT" : "POST";
    const url = editClient
      ? `http://localhost:3001/api/clients/${editClient}`
      : "http://localhost:3001/api/clients";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setForm({
        name: "",
        email: "",
        phone: "",
        type: "fizica",
        judet: "",
        localitate: "",
      });
      setEditClient(null);
      loadClienti();
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 Gestionare clienți</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Caută după nume"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: 10, padding: 5 }}
        />
        <input
          type="text"
          placeholder="Filtru județ"
          value={judetFilter}
          onChange={(e) => setJudetFilter(e.target.value)}
          style={{ marginRight: 10, padding: 5 }}
        />
        <input
          type="text"
          placeholder="Filtru localitate"
          value={localitateFilter}
          onChange={(e) => setLocalitateFilter(e.target.value)}
          style={{ padding: 5 }}
        />
      </div>

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Nume</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Tip</th>
            <th>Județ</th>
            <th>Localitate</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {clienti.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.type}</td>
              <td>{c.judet}</td>
              <td>{c.localitate}</td>
              <td>
                <button onClick={() => handleEdit(c)}>✒️</button>
                <button onClick={() => handleDelete(c.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editClient ? "✏️ Editează client" : "➕ Adaugă client nou"}</h3>
      <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nume"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Telefon"
        />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="fizica">Persoană fizică</option>
          <option value="juridica">Persoană juridică</option>
        </select>
        <input
          name="judet"
          value={form.judet}
          onChange={handleChange}
          placeholder="Județ"
        />
        <input
          name="localitate"
          value={form.localitate}
          onChange={handleChange}
          placeholder="Localitate"
        />
        <button type="submit">💾 Salvează</button>
      </form>
    </div>
  );
};

export default Clienti;
