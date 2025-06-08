const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Percorso al database SQLite
const DB_FILE = path.join(__dirname, "public", "data.db");

// Crea e apri il database SQLite
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Errore nell'aprire il database:", err);
  } else {
    console.log("Database SQLite connesso");
  }
});

// Middleware per il parsing del JSON e per servire file statici
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Assicurati che la tabella esista
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      birthDate TEXT,
      address TEXT,
      notes TEXT
    )
  `);
});

// API Routes

// GET - Leggere tutte le persone
app.get("/api/items", (req, res) => {
  db.all("SELECT * FROM items", (err, rows) => {
    if (err) {
      console.error("Errore nel recupero delle persone:", err);
      return res
        .status(500)
        .json({ error: "Errore nel recupero delle persone" });
    }
    res.json(rows);
  });
});

// POST - Aggiungere una nuova persona
app.post("/api/items", (req, res) => {
  const { firstName, lastName, email, phone, birthDate, address, notes } =
    req.body;

  // Validazione dei campi obbligatori
  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      error: "I campi Nome, Cognome e Email sono obbligatori",
    });
  }

  const stmt = db.prepare(
    "INSERT INTO items (firstName, lastName, email, phone, birthDate, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  stmt.run(
    firstName,
    lastName,
    email,
    phone || "",
    birthDate || "",
    address || "",
    notes || "",
    function (err) {
      if (err) {
        console.error("Errore nel salvataggio della persona:", err);
        return res
          .status(500)
          .json({ error: "Errore nel salvataggio della persona" });
      }
      res
        .status(201)
        .json({
          id: this.lastID,
          firstName,
          lastName,
          email,
          phone,
          birthDate,
          address,
          notes,
        });
    }
  );
  stmt.finalize();
});

// PUT - Aggiornare una persona
app.put("/api/items/:id", (req, res) => {
  const id = Number.parseInt(req.params.id);
  const { firstName, lastName, email, phone, birthDate, address, notes } =
    req.body;

  // Validazione dei campi obbligatori
  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      error: "I campi Nome, Cognome e Email sono obbligatori",
    });
  }

  const stmt = db.prepare(
    "UPDATE items SET firstName = ?, lastName = ?, email = ?, phone = ?, birthDate = ?, address = ?, notes = ? WHERE id = ?"
  );

  stmt.run(
    firstName,
    lastName,
    email,
    phone || "",
    birthDate || "",
    address || "",
    notes || "",
    id,
    function (err) {
      if (err) {
        console.error("Errore nell'aggiornamento della persona:", err);
        return res
          .status(500)
          .json({ error: "Errore nell'aggiornamento della persona" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Persona non trovata" });
      }
      res.json({
        id,
        firstName,
        lastName,
        email,
        phone,
        birthDate,
        address,
        notes,
      });
    }
  );
  stmt.finalize();
});

// DELETE - Eliminare una persona
app.delete("/api/items/:id", (req, res) => {
  const id = Number.parseInt(req.params.id);

  const stmt = db.prepare("DELETE FROM items WHERE id = ?");
  stmt.run(id, function (err) {
    if (err) {
      console.error("Errore nell'eliminazione della persona:", err);
      return res
        .status(500)
        .json({ error: "Errore nell'eliminazione della persona" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Persona non trovata" });
    }
    res.status(204).send();
  });
  stmt.finalize();
});

// GET - Ottenere una persona specifica
app.get("/api/items/:id", (req, res) => {
  const id = Number.parseInt(req.params.id);
  db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Errore nel recupero della persona:", err);
      return res.status(500).json({ error: "Errore interno del server" });
    }
    if (!row) {
      return res.status(404).json({ error: "Persona non trovata" });
    }
    res.json(row);
  });
});

// Gestione della route principale
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Gestione delle route non trovate
app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
