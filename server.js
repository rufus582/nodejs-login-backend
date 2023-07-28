const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./login.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the database.');

        db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);
    }
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error checking username:', err.message);
            return res.status(500).json({ success: false, message: 'An error occurred.' });
        }

        if (row) {
            return res.status(409).json({ success: false, message: 'Username already exists.' });
        }

        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
            if (err) {
                console.error('Error inserting user:', err.message);
                return res.status(500).json({ success: false, message: 'An error occurred.' });
            }

            console.log(`User with ID ${this.lastID} inserted into the database.`);
            return res.status(201).json({ success: true, message: 'User registered successfully.' });
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    db.get('SELECT * FROM users WHERE username = ? and password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Error checking user details:', err.message);
            return res.status(500).json({ success: false, message: 'An error occurred.' });
        }

        if (row) {
            return res.status(200).json({ success: true, message: 'Logged in.' });
        } else {
            return res.status(500).json({ success: false, message: 'Username or password is wrong!!!.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
