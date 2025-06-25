// app.js - initializare server Express
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();
const moment = require("moment");

const app = express();
const PORT = 3001;

// ==================== Intermediar ====================
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // JSON mare
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// ==================== Conectare bd MySQL ====================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fotovoltaice",
  charset: "utf8mb4", //caractere speciale  - diacritice
  multipleStatements: true,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Eroare la conectarea la baza de date:", err);
  } else {
    console.log("✅ Conectat la baza de date MySQL.");
  }
});

// ==================== functie reutilizabila pentru obtinerea urmatoarei zi disponibile ====================

function getNextAvailableDate(callback) {
  const sql = `
    SELECT DATE_ADD(CURDATE(), INTERVAL n DAY) AS data_posibila
    FROM (
      SELECT @row := @row + 1 AS n
      FROM information_schema.columns, (SELECT @row := -1) r
      LIMIT 30
    ) AS zile
    WHERE NOT EXISTS (
      SELECT 1 FROM programari 
      WHERE data_programare = DATE_ADD(CURDATE(), INTERVAL n DAY)
    )
    AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL n DAY)) NOT IN (1, 7)
    AND DATE_ADD(CURDATE(), INTERVAL n DAY) NOT IN (SELECT data FROM zile_blocate)
    LIMIT 1;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Eroare la căutarea zilei disponibile:", err);
      callback(null); // trimite null la eroare
    } else if (results.length === 0) {
      callback(null); // nu există zile libere
    } else {
      callback(results[0].data_posibila);
    }
  });
}

// ==================== LOGIN ====================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Eroare server." });
    if (results.length === 0)
      return res.status(401).json({ message: "Email inexistent." });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match)
        return res.status(401).json({ message: "Parolă greșită." });

      res.json({ email: user.email, role: user.role });
    });
  });
});

// ==================== CHANGE PASSWORD  - daca a uitat parola ====================
app.put("/api/users/:email/password", (req, res) => {
  const email = req.params.email;
  const { newPassword } = req.body;

  // Validare lungime si complexitate

  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: "Eroare la criptare." });

    db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hash, email],
      (err) => {
        if (err) return res.status(500).json({ message: "Eroare DB." });
        res.send("✅ Parola a fost actualizată.");
      }
    );
  });
});

// ==================== CHANGE PASSWORD  - daca se doreste schimbarea parolei ====================
app.put("/api/change-password", (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword)
    return res
      .status(400)
      .json({ message: "Toate câmpurile sunt obligatorii." });

  db.query(
    "SELECT password FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(500).json({ message: "Eroare la verificare." });

      const isMatch = await bcrypt.compare(oldPassword, results[0].password);
      if (!isMatch)
        return res.status(401).json({ message: "Parola veche este greșită." });

      const hashedNew = await bcrypt.hash(newPassword, 10);
      db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedNew, email],
        (err2) => {
          if (err2)
            return res.status(500).json({ message: "Eroare la actualizare." });
          res.json({ message: "Parola a fost schimbată cu succes." });
        }
      );
    }
  );
});

// ==================== UTILIZATORI ====================
app.post("/api/users", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Toate câmpurile sunt obligatorii." });
  }

  // Verifica daca utilizatorul exista deja
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Eroare server." });
      if (results.length > 0) {
        return res.status(409).json({ message: "Utilizatorul există deja." });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
          "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
          [email, hashedPassword, role],
          (err) => {
            if (err) {
              console.error("❌ Eroare la adăugare utilizator:", err);
              return res
                .status(500)
                .json({ message: "Eroare la adăugare utilizator." });
            }
            res
              .status(201)
              .json({ message: "✅ Utilizator adăugat cu succes!" });
          }
        );
      } catch (error) {
        res.status(500).json({ message: "Eroare la criptarea parolei." });
      }
    }
  );
});

// ==================== POST /api/forgot-password====================
app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 ora

  db.query(
    "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
    [token, expires, email],
    (err, result) => {
      if (err || result.affectedRows === 0) {
        return res.status(400).json({ message: "Email inexistent." });
      }

      const resetLink = `http://localhost:3000/reset-password/${token}`;

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "voltplan.adm@gmail.com",
        to: email,
        subject: "Resetare parolă VoltPlan",
        html: `
          <h3>Ai cerut resetarea parolei</h3>
          <p>Apasă pe linkul de mai jos pentru a-ți reseta parola:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Linkul expiră în 60 de minute.</p>
        `,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("❌ Email error:", error);
          return res.status(500).json({ message: "Eroare trimitere email." });
        }

        res.json({ message: "✅ Email de resetare trimis cu succes." });
      });
    }
  );
});

// ==================== POST /api/reset-password/:token====================
app.post("/api/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
    [token],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ message: "Token invalid sau expirat." });
      }

      const userId = results[0].id;

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: "Eroare criptare." });

        db.query(
          "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
          [hash, userId],
          (err) => {
            if (err)
              return res.status(500).json({ message: "Eroare salvare." });

            res.json({ message: "✅ Parola a fost resetată cu succes." });
          }
        );
      });
    }
  );
});

// ==================== MATERIALS ====================
app.get("/api/materials", (req, res) => {
  db.query("SELECT * FROM materials", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/api/materials", (req, res) => {
  const { name, type, unit, supplier, price } = req.body;
  db.query(
    "INSERT INTO materials (name, type, unit, supplier, price) VALUES (?, ?, ?, ?, ?)",
    [name, type, unit, supplier, price],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("✅ Material adăugat cu succes.");
    }
  );
});

app.put("/api/materials/:id", (req, res) => {
  const id = req.params.id;
  const { name, type, unit, supplier, price } = req.body;
  db.query(
    "UPDATE materials SET name = ?, type = ?, unit = ?, supplier = ?, price = ? WHERE id = ?",
    [name, type, unit, supplier, price, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("✅ Material modificat cu succes.");
    }
  );
});

app.delete("/api/materials/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM materials WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("🗑️ Material șters cu succes.");
  });
});

// ==================== CLIENTS ====================

app.get("/api/clients", (req, res) => {
  const { search, judet, localitate } = req.query;

  let sql = "SELECT * FROM clients WHERE 1";
  const params = [];

  if (search) {
    sql += " AND LOWER(name) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  if (judet) {
    sql += " AND LOWER(judet) LIKE ?";
    params.push(`%${judet.toLowerCase()}%`);
  }

  if (localitate) {
    sql += " AND LOWER(localitate) LIKE ?";
    params.push(`%${localitate.toLowerCase()}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Eroare la interogarea clienților:", err);
      return res.status(500).json({ error: "Eroare la interogare clienți" });
    }
    res.json(results);
  });
});

app.post("/api/clients", (req, res) => {
  const { name, email, phone, type, judet, localitate } = req.body;
  db.query(
    "INSERT INTO clients (name, email, phone, type, judet, localitate) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, phone, type, judet, localitate],
    (err) => {
      if (err) {
        console.error("❌ Eroare la adăugarea clientului:", err);
        return res.status(500).json({ error: "Eroare adăugare client" });
      }
      res.send("✅ Client adăugat cu succes.");
    }
  );
});

app.put("/api/clients/:id", (req, res) => {
  const id = req.params.id;
  const { name, email, phone, type, judet, localitate } = req.body;
  db.query(
    "UPDATE clients SET name = ?, email = ?, phone = ?, type = ?, judet = ?, localitate = ? WHERE id = ?",
    [name, email, phone, type, judet, localitate, id],
    (err) => {
      if (err) {
        console.error("❌ Eroare la actualizarea clientului:", err);
        return res.status(500).json({ error: "Eroare actualizare client" });
      }
      res.send("✅ Client actualizat cu succes.");
    }
  );
});

app.delete("/api/clients/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM clients WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("❌ Eroare la ștergerea clientului:", err);
      return res.status(500).json({ error: "Eroare ștergere client" });
    }
    res.send("🗑️ Client șters cu succes.");
  });
});

// ==================== PROJECTS ====================

app.post("/api/projects", (req, res) => {
  const {
    client_id,
    name,
    start_date,
    status,
    total,
    tva,
    total_cu_tva,
    tva_rate,
  } = req.body;
  db.query(
    "INSERT INTO projects (client_id, name, start_date, status, total, tva, total_cu_tva, tva_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [client_id, name, start_date, status, total, tva, total_cu_tva, tva_rate],
    (err, result) => {
      if (err) {
        console.error("❌ Eroare la salvare proiect:", err);
        return res.status(500).json({ error: "Eroare proiect" });
      }
      res.json({ id: result.insertId });
    }
  );
});

// ==================== DEVIZE ====================

app.post("/api/deviz_items", (req, res) => {
  const items = req.body;
  const values = items.map((item) => [
    item.project_id,
    item.material_id,
    item.quantity,
    item.unit_price,
  ]);
  db.query(
    "INSERT INTO deviz_items (project_id, material_id, quantity, unit_price) VALUES ?",
    [values],
    (err) => {
      if (err) {
        console.error("❌ Eroare la salvare materiale deviz:", err);
        return res.status(500).json({ error: "Eroare deviz_items" });
      }
      res.send("✅ Deviz salvat cu succes");
    }
  );
});

app.get("/api/devize", (req, res) => {
  const query = `
   SELECT 
  d.id AS deviz_id,
  d.project_id,
  p.name AS project_name,
  c.name AS client_name,
  p.start_date,
  p.status,
  (SELECT COUNT(*) FROM deviz_items di WHERE di.project_id = d.project_id) AS nr_materiale,
  p.total,
  p.tva,
  p.total_cu_tva,
  p.tva_rate
FROM devize d
JOIN projects p ON d.project_id = p.id
JOIN clients c ON p.client_id = c.id
ORDER BY p.start_date DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Eroare la interogare devize:", err);
      return res.status(500).json({ error: "Eroare interogare devize" });
    }
    res.json(results);
  });
});

// ==================== CREARE DEVIZ NOU ====================
app.post("/api/devize", (req, res) => {
  const { project_id } = req.body;

  if (!project_id) {
    return res
      .status(400)
      .json({ message: "Fără proiect asociat. Trimite project_id." });
  }

  const sql = "INSERT INTO devize (project_id) VALUES (?)";

  db.query(sql, [project_id], (err, result) => {
    if (err) {
      console.error("❌ Eroare la crearea devizului:", err);
      return res.status(500).json({ message: "Eroare la creare deviz." });
    }

    res.status(201).json({
      message: "✅ Deviz creat cu succes.",
      deviz_id: result.insertId,
    });
  });
});

// DELETE /api/projects/:id
app.delete("/api/projects/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM projects WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Eroare la ștergere:", err);
      return res.status(500).json({ message: "Eroare la ștergere" });
    }
    return res.json({ message: "Proiect șters" });
  });
});

// ==================== ACTUALIZARE DEVIZ - MODIFICAT ====================

// Actualizare proiect
app.put("/api/projects/:id", (req, res) => {
  const id = req.params.id;
  const {
    client_id,
    name,
    start_date,
    status,
    total,
    tva,
    total_cu_tva,
    tva_rate,
  } = req.body;

  db.query(
    `UPDATE projects SET client_id = ?, name = ?, start_date = ?, status = ?, total = ?, tva = ?, total_cu_tva = ?, tva_rate = ? WHERE id = ?`,
    [
      client_id,
      name,
      start_date,
      status,
      total,
      tva,
      total_cu_tva,
      tva_rate,
      id,
    ],
    (err) => {
      if (err) {
        console.error("Eroare update proiect:", err);
        return res
          .status(500)
          .json({ message: "Eroare la actualizare proiect" });
      }
      res.send("✅ Proiect actualizat.");
    }
  );
});

// stergere materiale vechi
app.delete("/api/deviz_items/:project_id", (req, res) => {
  const id = req.params.project_id;
  db.query("DELETE FROM deviz_items WHERE project_id = ?", [id], (err) => {
    if (err) {
      console.error("Eroare la ștergere materiale deviz:", err);
      return res.status(500).json({ message: "Eroare la ștergere materiale" });
    }
    res.send("✅ Materialele devizului au fost șterse.");
  });
});

// ==================== LISTA TOATE PROIECTELE ====================
app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects", (err, results) => {
    if (err) {
      console.error("❌ Eroare la interogarea proiectelor:", err);
      return res.status(500).json({ error: "Eroare proiecte" });
    }
    res.json(results);
  });
});

// ==================== OBTINERE PROIECT DUPA ID ====================
app.get("/api/projects/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM projects WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Eroare la interogare proiect:", err);
      return res.status(500).json({ error: "Eroare interogare proiect" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Proiectul nu a fost găsit" });
    }
    res.json(result[0]);
  });
});

// ============= RUTA INCARCARE MATERIALE DINTR-UN DEVIZ ====================
app.get("/api/deviz_items/:project_id", (req, res) => {
  const projectId = req.params.project_id;
  const query = `
    SELECT di.*, m.name, m.unit, m.type
    FROM deviz_items di
    JOIN materials m ON di.material_id = m.id
    WHERE di.project_id = ?
  `;
  db.query(query, [projectId], (err, result) => {
    if (err) {
      console.error("❌ Eroare la interogare deviz_items:", err);
      return res.status(500).json({ error: "Eroare deviz_items" });
    }
    res.json(result);
  });
});

// ==================== OFERTA ====================
// ============= RUTA INCARCARE MATERIALE DINTR-UN DEVIZ + CLIENT ====================
app.get("/api/devize/:project_id", (req, res) => {
  const projectId = req.params.project_id;

  const queryClient = `
  SELECT p.total, p.tva, p.total_cu_tva, p.tva_rate,
         p.client_id, c.name AS nume, c.email, c.phone AS telefon, c.judet, c.localitate, c.type
  FROM devize d
  JOIN projects p ON d.project_id = p.id
  JOIN clients c ON p.client_id = c.id
  WHERE d.project_id = ?
  `;

  const queryItems = `
    SELECT di.id, m.name, m.unit, m.price as unit_price, m.type, di.quantity
    FROM deviz_items di
    JOIN materials m ON di.material_id = m.id
    WHERE di.project_id = ?
  `;

  db.query(queryClient, [projectId], (errClient, resultClient) => {
    if (errClient || resultClient.length === 0) {
      console.error("❌ Eroare client deviz:", errClient);
      return res.status(500).json({ error: "Eroare client deviz" });
    }

    const client = resultClient[0];

    db.query(queryItems, [projectId], (errItems, resultItems) => {
      if (errItems) {
        console.error("❌ Eroare materiale deviz:", errItems);
        return res.status(500).json({ error: "Eroare materiale deviz" });
      }

      res.json({
        client,
        items: resultItems || [],
        total: client.total,
        tva: client.tva,
        total_cu_tva: client.total_cu_tva,
        tva_rate: client.tva_rate,
      });
    });
  });
});

// ==================== SALVARE OFERTE====================

//  Salvare oferta + verifica deviz + completare project_id
app.post("/api/offers", (req, res) => {
  const { deviz_id, nr_oferta, data, obiectiv, structura, ofertant } = req.body;

  //  Verificare deviz_id daca este
  if (!deviz_id) {
    return res.status(400).json({ message: "Deviz inexistent." });
  }

  //  cautare project_id corespunzător devizului
  db.query(
    "SELECT project_id FROM devize WHERE id = ?",
    [deviz_id],
    (err, rows) => {
      if (err || rows.length === 0 || !rows[0].project_id) {
        return res
          .status(400)
          .json({ message: "Deviz inexistent sau fără proiect asociat." });
      }

      const project_id = rows[0].project_id;

      const insertSql = `
      INSERT INTO offers (deviz_id, project_id, nr_oferta, data, obiectiv, structura, ofertant)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

      db.query(
        insertSql,
        [deviz_id, project_id, nr_oferta, data, obiectiv, structura, ofertant],
        (err2) => {
          if (err2) {
            console.error("Eroare salvare ofertă:", err2);
            return res.status(500).json({ message: "Eroare salvare ofertă." });
          }

          res.status(200).json({ message: "✅ Ofertă salvată cu succes." });
        }
      );
    }
  );
});

// ==================== ACTUALIZARE OFERTA  CAND NU ESTE FINALIZATA ====================
app.put("/api/offers/:id", (req, res) => {
  const { id } = req.params;
  const { nr_oferta, data, obiectiv, structura, ofertant, total } = req.body;

  const query = `
    UPDATE offers
    SET nr_oferta = ?, data = ?, obiectiv = ?, structura = ?, ofertant = ?, total = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [nr_oferta, data, obiectiv, structura, ofertant, total, id],
    (err, result) => {
      if (err) {
        console.error("Eroare actualizare ofertă:", err);
        return res.status(500).json({ message: "Eroare actualizare ofertă" });
      }
      res.json({ message: "✅ Ofertă actualizată cu succes" });
    }
  );
});

// ==================== OFERTE SALVATE ====================
app.get("/api/offers", (req, res) => {
  const sql = `
    SELECT o.*, 
       p.name AS project_name, 
       c.name AS client_name,
       p.total AS total_fara_tva, 
       p.total_cu_tva,
       (SELECT durata_zile 
        FROM programari 
        WHERE programari.project_id = p.id 
        ORDER BY data_programare ASC 
        LIMIT 1) AS durata_zile
FROM offers o
JOIN devize d ON o.deviz_id = d.id
JOIN projects p ON d.project_id = p.id
JOIN clients c ON p.client_id = c.id
ORDER BY o.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Eroare la interogarea ofertelor:", err);
      return res.status(500).json({ error: "Eroare la interogarea ofertelor" });
    }

    res.json(results);
  });
});

// Marchează ofertă ca acceptată
app.put("/api/offers/:id/accepta", (req, res) => {
  const offerId = req.params.id;

  const updateStatusSql = "UPDATE offers SET status = 'acceptata' WHERE id = ?";
  db.query(updateStatusSql, [offerId], (err) => {
    if (err)
      return res.status(500).json({ error: "Eroare la actualizare status." });

    // Obținem ziua disponibilă
    getNextAvailableDate((ziDisponibila) => {
      if (!ziDisponibila) {
        return res
          .status(500)
          .json({ message: "Nu s-a putut determina o zi disponibilă." });
      }

      const insertProgramare = `
        INSERT INTO programari (project_id, data_programare)
        SELECT d.project_id, ?
        FROM devize d
        JOIN offers o ON o.deviz_id = d.id
        WHERE o.id = ?
        AND NOT EXISTS (
          SELECT 1 FROM programari p WHERE p.project_id = d.project_id
        );
      `;

      db.query(insertProgramare, [ziDisponibila, offerId], (err2) => {
        if (err2) {
          console.error("❌ Eroare la inserare automată în programari:", err2);
          return res.status(500).json({
            message: "Status salvat, dar programarea automată a eșuat.",
          });
        }

        res.json({
          message: `✅ Status actualizat și lucrarea a fost programată pentru ${ziDisponibila}.`,
        });
      });
    });
  });
});

// stergere oferta
app.delete("/api/offers/:id", (req, res) => {
  const id = req.params.id;
  db.query(`DELETE FROM offers WHERE id = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Eroare ștergere" });
    res.json({ message: "Ofertă ștearsă" });
  });
});

// ==================== selectie durata montaj ====================

app.put("/api/offers/:id/durata", (req, res) => {
  const offerId = req.params.id;
  const { durata_zile } = req.body;
  const moment = require("moment");

  if (!durata_zile || durata_zile < 1) {
    return res.status(400).json({ error: "Durată invalidă" });
  }

  const getProjectIdSql = `SELECT project_id FROM offers WHERE id = ?`;
  db.query(getProjectIdSql, [offerId], (err, result) => {
    if (err || result.length === 0) {
      console.error("Eroare la obținere project_id:", err);
      return res.status(500).json({ error: "Eroare project_id" });
    }

    const projectId = result[0].project_id;

    const selectProg = `
      SELECT data_programare FROM programari
      WHERE project_id = ?
      ORDER BY data_programare ASC
    `;
    db.query(selectProg, [projectId], (err2, rows) => {
      if (err2) {
        console.error("Eroare select programări:", err2);
        return res.status(500).json({ error: "Eroare programari existente" });
      }

      const existente = rows.map((r) => r.data_programare);
      const dejaZile = existente.length;

      if (dejaZile === durata_zile) {
        return res.json({
          message: "✅ Durata actualizată. Nicio modificare necesară.",
        });
      }

      const updateSql = `
        UPDATE programari
        SET durata_zile = ?
        WHERE project_id = ?
      `;
      db.query(updateSql, [durata_zile, projectId], (err3) => {
        if (err3) {
          console.error("Eroare actualizare durata:", err3);
          return res.status(500).json({ error: "Eroare update durata" });
        }

        // 🔻 dacă trebuie să ștergem zile în plus
        if (durata_zile < dejaZile) {
          const zileDeSters = existente.slice(durata_zile);
          const stergeSql = `
            DELETE FROM programari 
            WHERE project_id = ? AND data_programare IN (?)
          `;
          db.query(stergeSql, [projectId, zileDeSters], (errStergere) => {
            if (errStergere) {
              console.error(
                "Eroare la ștergerea zilelor în plus:",
                errStergere
              );
              return res
                .status(500)
                .json({ error: "Eroare la reducerea duratei" });
            }

            return res.json({
              message: `✅ Durata redusă la ${durata_zile} zile. Zilele în plus au fost eliminate.`,
            });
          });
          return;
        }

        // 🔺 dacă trebuie să adăugăm zile noi
        const zileBlocQuery = `SELECT data FROM zile_blocate`;
        db.query(zileBlocQuery, (err4, blocateRows) => {
          if (err4) {
            console.error("Eroare select zile blocate:", err4);
            return res.status(500).json({ error: "Eroare zile blocate" });
          }

          const zileBloc = blocateRows.map((r) => r.data);
          let zi = moment(existente[existente.length - 1] || new Date()).add(
            1,
            "days"
          );
          const noiZile = [];

          while (noiZile.length < durata_zile - dejaZile) {
            const ziStr = zi.format("YYYY-MM-DD");
            const ziSapt = zi.day();

            if (
              ziSapt !== 0 &&
              ziSapt !== 6 &&
              !zileBloc.includes(ziStr) &&
              !existente.includes(ziStr)
            ) {
              noiZile.push([projectId, ziStr, "programata", null, durata_zile]);
            }

            zi.add(1, "days");
          }

          const insertSql = `
            INSERT INTO programari (project_id, data_programare, status, observatii, durata_zile)
            VALUES ?
          `;

          db.query(insertSql, [noiZile], (err5) => {
            if (err5) {
              console.error("Eroare la inserare zile noi:", err5);
              return res.status(500).json({ error: "Eroare inserare zile" });
            }

            res.json({
              message: `✅ Durata actualizată. S-au adăugat ${noiZile.length} zile noi în calendar.`,
            });
          });
        });
      });
    });
  });
});

// ==================== actualizare  durata montaj ====================
app.put("/api/programari/:id/durata", (req, res) => {
  const id = req.params.id;
  const { durata_zile } = req.body;

  db.query(
    "UPDATE programari SET durata_zile = ? WHERE project_id = ?",
    [durata_zile, id],
    (err, result) => {
      if (err) {
        console.error("Eroare la actualizarea duratei:", err);
        return res.status(500).json({ error: "Eroare la server." });
      }
      res.json({ success: true });
    }
  );
});

// ==================== VIZUALIZARE OFERTA====================
app.get("/api/offers/:id", (req, res) => {
  const offerId = req.params.id;

  const ofertaQuery = `
  SELECT o.*, d.project_id, p.name AS project_name,
         p.total, p.tva, p.total_cu_tva,
         c.name AS client_name, c.email AS client_email,
         c.phone AS client_phone, c.localitate AS client_localitate,
         c.judet AS client_judet
  FROM offers o
  JOIN devize d ON o.deviz_id = d.id
  JOIN projects p ON d.project_id = p.id
  JOIN clients c ON p.client_id = c.id
  WHERE o.id = ?
`;

  db.query(ofertaQuery, [offerId], (err, ofertaResult) => {
    if (err) {
      console.error("Eroare la preluarea ofertei:", err);
      return res.status(500).json({ error: "Eroare la server." });
    }

    if (ofertaResult.length === 0) {
      return res.status(404).json({ error: "Oferta nu a fost găsită." });
    }

    const oferta = ofertaResult[0];

    const articoleQuery = `
      SELECT di.*, m.name, m.unit, m.price, di.material_id
      FROM deviz_items di
      JOIN materials m ON di.material_id = m.id
      WHERE di.project_id = ?
    `;

    db.query(articoleQuery, [oferta.project_id], (err, articoleResult) => {
      if (err) {
        console.error("Eroare la preluarea articolelor:", err);
        return res.status(500).json({ error: "Eroare la server." });
      }

      res.json({
        oferta,
        articole: articoleResult,
      });
    });
  });
});

// ==================== STATUS OFERTA ====================
app.put("/api/offers/:id/status", (req, res) => {
  const offerId = req.params.id;
  const { status, durata_zile = 1 } = req.body;

  const updateStatusQuery = `UPDATE offers SET status = ? WHERE id = ?`;

  db.query(updateStatusQuery, [status, offerId], (err) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Eroare la actualizarea statusului ofertei." });

    if (status === "respinsa" || status === "in_asteptare") {
      const getProjectQuery = `SELECT project_id FROM offers WHERE id = ?`;
      db.query(getProjectQuery, [offerId], (err2, rows) => {
        if (err2 || rows.length === 0) return res.sendStatus(200);

        const projectId = rows[0].project_id;
        db.query(
          `DELETE FROM programari WHERE project_id = ?`,
          [projectId],
          (err3) => {
            if (err3) console.error("Eroare la ștergerea programării:", err3);
            return res.json({
              message: `Status actualizat + programarea a fost ștearsă (dacă exista).`,
            });
          }
        );
      });
      return;
    }

    if (status === "acceptata") {
      const sql = `
        INSERT INTO devize (project_id)
        SELECT o.project_id
        FROM offers o
        LEFT JOIN devize d ON d.project_id = o.project_id
        WHERE o.id = ? AND o.deviz_id IS NULL AND d.id IS NULL;

        UPDATE offers o
        JOIN devize d ON d.project_id = o.project_id
        SET o.deviz_id = d.id
        WHERE o.id = ? AND (o.deviz_id IS NULL OR NOT EXISTS (
          SELECT 1 FROM devize d2 WHERE d2.id = o.deviz_id
        ));
      `;

      db.query(sql, [offerId, offerId], (err2) => {
        if (err2) {
          console.error("Eroare creare/actualizare deviz:", err2);
          return res.status(500).json({ message: "Eroare creare deviz." });
        }

        getNextAvailableDate((ziStart) => {
          if (!ziStart) {
            return res
              .status(500)
              .json({ message: "Nu s-a găsit o zi disponibilă." });
          }

          // verifica daca ziua este valida
          function verificaZiValida(zi, callback) {
            const ziSaptamana = moment(zi).day(); // 0 = duminica, 6 = sambata
            if (ziSaptamana === 0 || ziSaptamana === 6) return callback(false);

            db.query(
              "SELECT COUNT(*) AS nr FROM zile_blocate WHERE data = ?",
              [zi],
              (err, result) => {
                if (err) {
                  console.error("Eroare la verificare zi blocată:", err);
                  return callback(false);
                }
                callback(result[0].nr === 0); // zi valida daca nu este blocata
              }
            );
          }

          // adaugă zile valide  - fara weekend si zile blocate
          function adaugaZileValide(startZi, numarZile, callbackFinal) {
            const zileFinale = [];
            let zi = moment(startZi);

            function urmatoarea() {
              if (zileFinale.length >= numarZile)
                return callbackFinal(zileFinale);

              const ziFormat = zi.format("YYYY-MM-DD");
              verificaZiValida(ziFormat, (valida) => {
                if (valida) zileFinale.push(ziFormat);
                zi.add(1, "days");
                urmatoarea();
              });
            }

            urmatoarea();
          }

          // apel principal
          adaugaZileValide(ziStart, durata_zile, (zileDeInserat) => {
            const getProjectId = `SELECT project_id FROM offers WHERE id = ?`;
            db.query(getProjectId, [offerId], (err3, rows) => {
              if (err3 || rows.length === 0)
                return res
                  .status(500)
                  .json({ message: "Eroare la project_id." });

              const projectId = rows[0].project_id;
              const valori = zileDeInserat
                .map(
                  (zi) =>
                    `(${projectId}, '${zi}', 'programata', NULL, ${durata_zile})`
                )
                .join(",");

              const insertMulti = `
                INSERT INTO programari (project_id, data_programare, status, observatii, durata_zile)
                VALUES ${valori}
              `;

              db.query(insertMulti, (err4) => {
                if (err4) {
                  console.error("Eroare la inserare multiplă:", err4);
                  return res.status(500).json({
                    message: "Eroare salvare programări multiple.",
                  });
                }

                res.json({
                  message: `✅ Lucrarea a fost programată pe ${durata_zile} zile începând cu ${ziStart} (fără weekend sau zile blocate).`,
                });
              });
            });
          });
        });
      });
      return;
    }

    res.json({ message: "✅ Status actualizat cu succes." });
  });
});

// ==================== NECESAR MATERIALE ====================
app.get("/api/materiale-necesar", (req, res) => {
  const sql = `
    SELECT m.name, m.type, SUM(di.quantity) AS total_cantitate, m.unit
    FROM offers o
    JOIN devize d ON o.deviz_id = d.id
    JOIN projects p ON d.project_id = p.id
    JOIN deviz_items di ON p.id = di.project_id
    JOIN materials m ON di.material_id = m.id
    WHERE o.status = 'acceptata'
    GROUP BY m.name, m.type, m.unit
    ORDER BY m.type, m.name;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Eroare la generarea necesarului:", err);
      return res.status(500).json({ error: "Eroare server." });
    }
    res.json(results);
  });
});

// ==================== TRIMITERE OFERTA PE EMAIL ====================
app.post("/api/send-offer-email", (req, res) => {
  const { to, subject, text, pdfBase64, nrOferta } = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "voltplan.adm@gmail.com",
    to,
    subject,
    text,
    attachments: [
      {
        filename: `Oferta_${nrOferta}.pdf`,
        content: Buffer.from(pdfBase64, "base64"),
        contentType: "application/pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Eroare la trimiterea emailului:", error);
      return res.status(500).json({ error: "Eroare la trimitere email." });
    } else {
      console.log("✅ Email trimis:", info.response);
      res.json({ success: true });
    }
  });
});

// ==================== PROGRAMARI ====================
app.get("/api/programari", (req, res) => {
  const sql = `
    SELECT p.id, p.data_programare, p.status, p.observatii,
           pr.name AS project_name, c.name AS client_name
    FROM programari p
    JOIN projects pr ON p.project_id = pr.id
    JOIN clients c ON pr.client_id = c.id
    ORDER BY p.data_programare ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Eroare la preluarea programarilor:", err);
      return res.status(500).json({ error: "Eroare la server." });
    }
    res.json(results);
  });
});

app.post("/api/programari", (req, res) => {
  const { project_id, data_programare } = req.body;
  db.query(
    "INSERT INTO programari (project_id, data_programare) VALUES (?, ?)",
    [project_id, data_programare],
    (err) => {
      if (err)
        return res.status(500).json({ error: "Eroare inserare programare" });
      res.json({ message: "✅ Programare adăugată" });
    }
  );
});

// ✅ Actualizare status pentru toate zilele dintr-un proiect
app.put("/api/programari/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  // 1. Aflăm project_id
  const getProjectIdSql = `SELECT project_id FROM programari WHERE id = ?`;
  db.query(getProjectIdSql, [id], (err, rows) => {
    if (err || rows.length === 0) {
      console.error("❌ Eroare la obținere project_id:", err);
      return res.status(500).json({ error: "Eroare project_id" });
    }

    const projectId = rows[0].project_id;

    // 2. Update status pentru toate zilele acelui proiect
    const updateZileSql = `UPDATE programari SET status = ? WHERE project_id = ?`;
    db.query(updateZileSql, [status, projectId], (err2) => {
      if (err2) {
        console.error("❌ Eroare actualizare status zile:", err2);
        return res.status(500).json({ error: "Eroare update programari" });
      }

      // 3. Update status și în `offers`
      const updateOfertaSql = `
        UPDATE offers o
        JOIN devize d ON o.deviz_id = d.id
        SET o.status = ?
        WHERE d.project_id = ?
        AND o.status IN ('acceptata', 'in_curs', 'finalizata')
      `;
      db.query(updateOfertaSql, [status, projectId], (err3) => {
        if (err3) {
          console.error("❌ Eroare update status ofertă:", err3);
          return res.status(500).json({ error: "Eroare update ofertă" });
        }

        res.json({
          message: `✅ Statusul '${status}' a fost aplicat pentru întreaga lucrare.`,
        });
      });
    });
  });
});

// DELETE pentru stergere
app.delete("/api/programari/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM programari WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Eroare la ștergere programare:", err);
      return res.status(500).json({ error: "Eroare server." });
    }
    res.sendStatus(200);
  });
});

app.put("/api/programari/:id/data", (req, res) => {
  const { id } = req.params;
  const { data_programare } = req.body;

  db.query(
    "UPDATE programari SET data_programare = ? WHERE id = ?",
    [data_programare, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Eroare reprogramare" });
      res.json({ message: "✅ Data programării modificată" });
    }
  );
});

app.put("/api/programari/:id/observatii", (req, res) => {
  const { id } = req.params;
  const { observatii } = req.body;

  db.query(
    "UPDATE programari SET observatii = ? WHERE id = ?",
    [observatii, id],
    (err) => {
      if (err) {
        console.error("Eroare la salvarea observațiilor:", err);
        return res.status(500).json({ error: "Eroare la salvare observații" });
      }
      res.json({ message: "✅ Observații actualizate" });
    }
  );
});

//  RUTa pentru generarea programarilor din ofertele acceptate ====================
app.post("/api/programari/genereaza-din-oferte", (req, res) => {
  const sql = `
    INSERT INTO programari (project_id, data_programare)
    SELECT d.project_id, CURDATE() + INTERVAL 3 DAY
    FROM offers o
    JOIN devize d ON o.deviz_id = d.id
    WHERE o.status = 'acceptata'
    AND NOT EXISTS (
      SELECT 1 FROM programari p WHERE p.project_id = d.project_id
    );
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Eroare la generarea programărilor:", err);
      return res.status(500).json({ message: "Eroare la server." });
    }
    res.json({
      message: "Programările au fost generate cu succes.",
      adaugate: result.affectedRows,
    });
  });
});

// ==================== ZILE DISPONIBILE SAU BLOCATE ====================
app.get("/api/urmatoarea-zi-disponibila", (req, res) => {
  const sql = `
    SELECT DATE_ADD(CURDATE(), INTERVAL n DAY) AS data_posibila
    FROM (
      SELECT @row := @row + 1 AS n
      FROM information_schema.columns, (SELECT @row := -1) r
      LIMIT 30
    ) AS zile
    WHERE NOT EXISTS (
      SELECT 1 FROM programari 
      WHERE data_programare = DATE_ADD(CURDATE(), INTERVAL n DAY)
    )
    AND DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL n DAY)) NOT IN (1, 7) -- exclude duminică și sâmbătă
    AND DATE_ADD(CURDATE(), INTERVAL n DAY) NOT IN (SELECT data FROM zile_blocate)
    LIMIT 1
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Eroare la calcularea datei disponibile:", err);
      return res.status(500).json({ error: "Eroare server" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: "Nu s-a găsit o zi disponibilă." });
    }

    res.json({ data: result[0].data_posibila });
  });
});

// ==================== ruta de actualizare in cascada daca ziua devine blocata====================
app.post("/api/zile-blocate", (req, res) => {
  const { data } = req.body;

  const sqlInsert = "INSERT INTO zile_blocate (data) VALUES (?)";

  db.query(sqlInsert, [data], (err) => {
    if (err)
      return res.status(500).json({ error: "Eroare inserare zi blocată" });

    // o zi in plus a programarilor ulterioare
    const sqlUpdate = `
      UPDATE programari
      SET data_programare = DATE_ADD(data_programare, INTERVAL 1 DAY)
      WHERE data_programare >= ?
    `;

    db.query(sqlUpdate, [data], (err2) => {
      if (err2) return res.status(500).json({ error: "Eroare reprogramare" });

      res.json({ message: "✅ Zi blocată și programări decalate" });
    });
  });
});

// ruat pentru obtinerea tuturor zilelor blocate
app.get("/api/zile-blocate", (req, res) => {
  db.query("SELECT * FROM zile_blocate", (err, results) => {
    if (err) {
      console.error("Eroare la interogare zile_blocate:", err);
      return res.status(500).json({ error: "Eroare server" });
    }
    res.json(results);
  });
});

// ==================== deblocare zile blocate====================
app.delete("/api/zile-blocate/:data", (req, res) => {
  const { data } = req.params;

  const sql = "DELETE FROM zile_blocate WHERE data = ?";
  db.query(sql, [data], (err, result) => {
    if (err) {
      console.error("Eroare la ștergerea zilei blocate:", err);
      return res.status(500).json({ error: "Eroare server" });
    }

    res.json({ message: `✅ Ziua ${data} a fost deblocată.` });
  });
});

// ==================== ruta de actualizare in cascada daca ziua se deblocheaza ====================

app.delete("/api/zile-blocate/:data", (req, res) => {
  const ziDeblocata = req.params.data;

  const deleteSql = "DELETE FROM zile_blocate WHERE data = ?";
  db.query(deleteSql, [ziDeblocata], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Eroare la ștergere zi blocată" });

    //  După stergere, muta inapoi lucrarile dacă ziua este libera si valiad
    const verificareSql = `
      SELECT id, project_id, data_programare FROM programari
      WHERE data_programare > ?
      ORDER BY data_programare ASC
    `;

    db.query(verificareSql, [ziDeblocata], (err2, rows) => {
      if (err2)
        return res
          .status(500)
          .json({ error: "Eroare la verificare programări" });

      let promises = [];

      for (let row of rows) {
        const potentialDate = moment(row.data_programare)
          .subtract(1, "days")
          .format("YYYY-MM-DD");

        // verifica disponibilitate
        const verificariSql = `
          SELECT 
            (SELECT COUNT(*) FROM zile_blocate WHERE data = ?) AS blocata,
            (SELECT COUNT(*) FROM programari WHERE data_programare = ?) AS ocupata,
            DAYOFWEEK(?) AS zi
        `;

        const p = new Promise((resolve) => {
          db.query(
            verificariSql,
            [potentialDate, potentialDate, potentialDate],
            (err3, res3) => {
              if (err3) return resolve(null);

              const { blocata, ocupata, zi } = res3[0];
              if (blocata === 0 && ocupata === 0 && zi !== 1 && zi !== 7) {
                // zi valida, muta lucrarea inapoi
                const updateSql = `UPDATE programari SET data_programare = ? WHERE id = ?`;
                db.query(updateSql, [potentialDate, row.id], (err4) => {
                  if (err4) console.error("Eroare la mutare înapoi:", err4);
                  resolve(true);
                });
              } else {
                resolve(false); // nu se muta
              }
            }
          );
        });

        promises.push(p);
      }

      Promise.all(promises).then(() => {
        res.json({
          message: "✅ Ziua a fost deblocată. Lucrările au fost reanalizate.",
        });
      });
    });
  });
});

// ==================== /api/devize-by-id/:id ====================
app.get("/api/devize-by-id/:id", (req, res) => {
  const devizId = req.params.id;

  const sql = `
    SELECT d.project_id, p.name AS project_name, c.id AS client_id, c.name AS nume, c.email, c.phone AS telefon, c.judet, c.localitate, c.type,
           p.total, p.tva, p.total_cu_tva, p.tva_rate
    FROM devize d
    JOIN projects p ON d.project_id = p.id
    JOIN clients c ON p.client_id = c.id
    WHERE d.id = ?
  `;

  db.query(sql, [devizId], (err, results) => {
    if (err) {
      console.error("Eroare la interogare client:", err);
      return res.status(500).json({ error: "Eroare server." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Devizul nu a fost găsit." });
    }

    const client = results[0];

    const sqlItems = `
      SELECT m.id, m.name, m.unit, m.type, di.quantity, di.unit_price
      FROM deviz_items di
      JOIN materials m ON di.material_id = m.id
      WHERE di.project_id = ?
    `;

    db.query(sqlItems, [client.project_id], (err2, items) => {
      if (err2) {
        console.error("Eroare la interogare materiale:", err2);
        return res
          .status(500)
          .json({ error: "Eroare la interogarea materialelor." });
      }

      res.json({
        client,
        items,
        total: client.total,
        tva: client.tva,
        total_cu_tva: client.total_cu_tva,
        tva_rate: client.tva_rate,
      });
    });
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe http://localhost:${PORT}`);
});
