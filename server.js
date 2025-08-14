// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'apmcData.json');

/** Read the latest APMC data from JSON file */
function readApmcData() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error('🔴 Error reading apmcData.json:', err);
        return {}; // return empty object on failure
    }
}

/** GET / → returns latest prices (default route) */
app.get('/', (req, res) => {
    res.json(readApmcData());
});

/** GET /apmc → returns latest prices (alternate route) */
app.get('/apmc', (req, res) => {
    res.json(readApmcData());
});

/** GET /run-scraper → triggers scraper.js manually */
app.get('/run-scraper', async (req, res) => {
    try {
        const runScraper = require('./scraper'); // scraper exports async fn
        await runScraper();
        res.json({ status: '✅ Scraper executed successfully' });
    } catch (err) {
        console.error('🔴 Scraper failed:', err);
        res.status(500).json({ status: 'Scraper failed', error: err.message });
    }
});

app.listen(PORT, () =>
    console.log(`🚀 APMC API running on http://localhost:${PORT}`)
);
