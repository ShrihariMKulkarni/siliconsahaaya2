const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Helper to read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { complaints: [], emailLogs: [] };
    }
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// --- API Routes ---

// Get all data for initialization
app.get('/api/all', (req, res) => {
    res.json(readDB());
});

// Complaints routes
app.get('/api/complaints', (req, res) => {
    const db = readDB();
    res.json(db.complaints);
});

app.post('/api/complaints', (req, res) => {
    const db = readDB();
    const newComplaint = req.body;
    
    // Check if it already exists (ID match)
    const index = db.complaints.findIndex(c => c.id === newComplaint.id);
    if (index !== -1) {
        db.complaints[index] = newComplaint;
    } else {
        db.complaints.unshift(newComplaint);
    }
    
    writeDB(db);
    res.json({ success: true });
});

app.put('/api/complaints/:id', (req, res) => {
    const db = readDB();
    const id = req.params.id;
    const update = req.body;
    const index = db.complaints.findIndex(c => c.id === id);
    if (index !== -1) {
        db.complaints[index] = { ...db.complaints[index], ...update };
        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Complaint not found' });
    }
});

// Email Logs routes
app.get('/api/emaillogs', (req, res) => {
    const db = readDB();
    res.json(db.emailLogs);
});

app.post('/api/emaillogs', (req, res) => {
    const db = readDB();
    db.emailLogs = req.body; // Overwrite or handle appropriately
    writeDB(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`DB File: ${DB_FILE}`);
});
