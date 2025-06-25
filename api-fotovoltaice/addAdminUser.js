const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fotovoltaice",
});

const email = "admin@example.com";
const plainPassword = "admin123";
const role = "admin";

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error("Eroare la criptarea parolei:", err);
    return;
  }

  const query = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
  db.query(query, [email, hashedPassword, role], (err, result) => {
    if (err) {
      console.error("Eroare la inserare în baza de date:", err);
    } else {
      console.log("✅ Utilizator admin adăugat cu succes!");
    }
    db.end();
  });
});
