// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const runScraper = require('./scraper'); // scraper.js exports async function

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'apmcData.json');

/** Helper: Save data to JSON file (optional for caching) */
function saveApmcData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Data saved to apmcData.json');
    } catch (err) {
        console.error('🔴 Failed to save JSON file:', err);
    }
}

/** GET /apmc → scrape fresh data and return JSON */
app.get('/apmc', async (req, res) => {
    try {
        console.log('⏳ Running scraper for JSON...');
        const data = await runScraper();
        saveApmcData(data); // optional: store locally
        res.json(data);
    } catch (err) {
        console.error('🔴 Scraper failed for /apmc:', err);
        res.status(500).json({ error: 'Scraper failed', details: err.message });
    }
});

/** GET /apmc.csv → scrape fresh data and return CSV */
app.get('/apmc.csv', async (req, res) => {
    try {
        console.log('⏳ Running scraper for CSV...');
        const data = await runScraper();
        saveApmcData(data); // optional: store locally

        // Convert JSON to CSV
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row =>
            Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        const csv = [headers, ...rows].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('apmc.csv');
        res.send(csv);
    } catch (err) {
        console.error('🔴 Scraper failed for /apmc.csv:', err);
        res.status(500).send('Scraper failed');
    }
});

/** Root: redirect to /apmc */
app.get('/', (req, res) => {
    res.redirect('/apmc');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
