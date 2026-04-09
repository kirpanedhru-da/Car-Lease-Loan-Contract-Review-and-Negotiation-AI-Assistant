const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database 
// This creates a physical 'database.sqlite' file to securely store user data locally
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database: ", err.message);
    } else {
        console.log("Secure SQLite database connected successfully.");
    }
});

// Create tables for secure login and history tracking
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        contract_name TEXT,
        date_scanned TEXT,
        fairness_score INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// --- API Endpoints ---

// 1. Secure User Registration
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], function(err) {
        if (err) {
            return res.status(400).json({ error: "Email already registered or invalid data!" });
        }
        res.json({ message: "Registration successful!", user_id: this.lastID });
    });
});

// 2. User Login Authentication
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT id, name, email FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: "Server error during login" });
        if (!row) return res.status(401).json({ error: "Invalid email or password" });
        
        res.json({ message: `Welcome back, ${row.name}!`, user: row });
    });
});

// 3. Get User's Contract Scan History
app.get('/api/history/:user_id', (req, res) => {
    db.all('SELECT * FROM history WHERE user_id = ? ORDER BY id DESC', [req.params.user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: "Could not fetch history." });
        res.json({ history: rows });
    });
});

// 4. Save a new contract scan to history
app.post('/api/history', (req, res) => {
    const { user_id, contract_name, date_scanned, fairness_score } = req.body;
    db.run('INSERT INTO history (user_id, contract_name, date_scanned, fairness_score) VALUES (?, ?, ?, ?)', 
    [user_id, contract_name, date_scanned, fairness_score], function(err) {
        if (err) return res.status(500).json({ error: "Failed to save to history." });
        res.json({ message: "Saved to history successfully." });
    });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Backend Server Running SECURELY`);
    console.log(`Listening on http://localhost:${PORT}`);
    console.log(`=================================`);
});
