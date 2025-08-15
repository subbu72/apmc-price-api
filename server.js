// server.js
const express = require("express");
const fs = require("fs");
const fetchAPMCPrices = require("./scraper");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve JSON directly
app.get("/apmc", async (req, res) => {
    try {
        if (!fs.existsSync("apmcData.json")) {
            await fetchAPMCPrices();
        }
        const data = fs.readFileSync("apmcData.json", "utf-8");
        res.setHeader("Content-Type", "application/json");
        res.send(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to load APMC data" });
    }
});

// Serve CSV
app.get("/apmc.csv", async (req, res) => {
    try {
        if (!fs.existsSync("apmcData.json")) {
            await fetchAPMCPrices();
        }
        const jsonData = JSON.parse(fs.readFileSync("apmcData.json", "utf-8"));

        // Convert to CSV
        const headers = Object.keys(jsonData[0]).join(",") + "\n";
        const rows = jsonData.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.attachment("apmc.csv");
        res.send(headers + rows);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate CSV" });
    }
});

// Manual scraper trigger
app.get("/run-scraper", async (req, res) => {
    try {
        await fetchAPMCPrices();
        res.json({ status: "Scraper run successfully" });
    } catch (error) {
        res.status(500).json({ error: "Scraper failed" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
