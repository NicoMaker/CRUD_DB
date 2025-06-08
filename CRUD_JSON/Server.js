const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "public", "data.json");

// Middleware per il parsing del JSON e per servire file statici
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Assicurati che il file data.json esista
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Funzione per leggere i dati dal file JSON
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Errore nella lettura del file:", error);
    return [];
  }
};

// Funzione per scrivere i dati nel file JSON
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Errore nella scrittura del file:", error);
    return false;
  }
};

// API Routes

// GET - Leggere tutte le persone
app.get("/api/items", (req, res) => {
  try {
    const items = readData();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero delle persone" });
  }
});

// POST - Aggiungere una nuova persona
app.post("/api/items", (req, res) => {
  try {
    const { firstName, lastName, email, phone, birthDate, address, notes } =
      req.body;

    // Validazione dei campi obbligatori
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "I campi Nome, Cognome e Email sono obbligatori",
      });
    }

    const items = readData();
    const newItem = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phone: phone || "",
      birthDate: birthDate || "",
      address: address || "",
      notes: notes || "",
    };

    items.push(newItem);

    if (writeData(items)) {
      res.status(201).json(newItem);
    } else {
      res.status(500).json({ error: "Errore nel salvataggio della persona" });
    }
  } catch (error) {
    console.error("Errore nell'aggiunta della persona:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

// PUT - Aggiornare una persona
app.put("/api/items/:id", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    const { firstName, lastName, email, phone, birthDate, address, notes } =
      req.body;

    // Validazione dei campi obbligatori
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error: "I campi Nome, Cognome e Email sono obbligatori",
      });
    }

    const items = readData();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Persona non trovata" });
    }

    // Aggiorna i dati della persona
    items[index] = {
      ...items[index],
      firstName,
      lastName,
      email,
      phone: phone || "",
      birthDate: birthDate || "",
      address: address || "",
      notes: notes || "",
    };

    if (writeData(items)) {
      res.json(items[index]);
    } else {
      res
        .status(500)
        .json({ error: "Errore nell'aggiornamento della persona" });
    }
  } catch (error) {
    console.error("Errore nell'aggiornamento della persona:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

// DELETE - Eliminare una persona
app.delete("/api/items/:id", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    let items = readData();
    const initialLength = items.length;

    items = items.filter((item) => item.id !== id);

    if (items.length === initialLength) {
      return res.status(404).json({ error: "Persona non trovata" });
    }

    if (writeData(items)) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: "Errore nell'eliminazione della persona" });
    }
  } catch (error) {
    console.error("Errore nell'eliminazione della persona:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

// GET - Ottenere una persona specifica
app.get("/api/items/:id", (req, res) => {
  try {
    const id = Number.parseInt(req.params.id);
    const items = readData();
    const item = items.find((item) => item.id === id);

    if (!item) {
      return res.status(404).json({ error: "Persona non trovata" });
    }

    res.json(item);
  } catch (error) {
    console.error("Errore nel recupero della persona:", error);
    res.status(500).json({ error: "Errore interno del server" });
  }
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
