const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

// Initialize SQLite database
const db = new sqlite3.Database("./data.sqlite"); // In-memory database for demonstration, change to a file path for a persistent database

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS sensor_data (temperature REAL, humidity REAL, timestamp TEXT)");
});
  

// Middleware to parse JSON request body
app.use(express.json());

// Endpoint to store sensor data
app.post("/sensor-data", (req, res) => {
  const { temperature, humidity } = req.body;
  const timestamp = new Date().toISOString();

  if (!temperature || !humidity) {
    res.status(400).json({ error: "Missing required parameters" });
    return;
  }

  // Insert data into database
  db.run(
    "INSERT INTO sensor_data (temperature, humidity, timestamp) VALUES (?, ?, ?)",
    [temperature, humidity, timestamp],
    (err) => {
      if (err) {
        console.error("Error inserting data:", err.message);
        res.status(500).json({ error: "Failed to store sensor data" });
      } else {
        console.log("Sensor data stored successfully.");
        res.status(200).json({ message: "Sensor data stored successfully." });
      }
    }
  );
});

app.get("/current-data", (req, res) => {
  // Retrieve the last inserted data from the database
  db.get(
    "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1",
    (err, row) => {
      if (err) {
        console.error("Error retrieving data:", err.message);
        res.status(500).json({ error: "Failed to retrieve data" });
      } else {
        res.status(200).json(row);
      }
    }
  );
});

// Endpoint to return all data (limited to 100)
app.get("/all-data", (req, res) => {
  // Retrieve all data from the database, limited to 100 records
  db.all(
    "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 100",
    (err, rows) => {
      if (err) {
        console.error("Error retrieving data:", err.message);
        res.status(500).json({ error: "Failed to retrieve data" });
      } else {
        res.status(200).json(rows);
      }
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
