require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const API_KEY = process.env.API_KEY;  // <-- now from .env
const RESOURCE_ID = '579b464db66ec23bdd000001d67799901822467054ba3d6fcc9ca71a';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;


async function fetchAllData() {
    let allRecords = [];
    let offset = 0;
    const limit = 100;
    let total = null;

    console.log("Fetching Mandi data from API...");

    while (true) {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    'api-key': API_KEY,
                    format: 'json',
                    limit,
                    offset
                }
            });

            const data = response.data;
            if (!total) total = data.total;
            allRecords = allRecords.concat(data.records);

            console.log(`Fetched ${allRecords.length} / ${total} records...`);

            if (allRecords.length >= total) break;

            offset += limit;

        } catch (err) {
            console.error("Error fetching data:", err.message);
            break;
        }
    }

    return allRecords;
}

async function saveToCSV(records) {
    const csvWriter = createCsvWriter({
        path: 'mandi_prices.csv',
        header: [
            { id: 'state', title: 'State' },
            { id: 'district', title: 'District' },
            { id: 'market', title: 'Market' },
            { id: 'commodity', title: 'Commodity' },
            { id: 'variety', title: 'Variety' },
            { id: 'grade', title: 'Grade' },
            { id: 'arrival_date', title: 'Arrival Date' },
            { id: 'min_price', title: 'Min Price' },
            { id: 'max_price', title: 'Max Price' },
            { id: 'modal_price', title: 'Modal Price' }
        ]
    });

    await csvWriter.writeRecords(records);
    console.log("✅ Data saved to mandi_prices.csv");
}

(async () => {
    const data = await fetchAllData();
    if (data.length > 0) {
        await saveToCSV(data);
    } else {
        console.log("⚠ No data found.");
    }
})();
const cron = require('node-cron');

cron.schedule('0 7 * * *', async () => {
    console.log("⏰ Running scheduled mandi data fetch at 7 AM...");
    const data = await fetchAllData();
    if (data.length > 0) {
        await saveToCSV(data);
    } else {
        console.log("⚠ No data found.");
    }
}, {
    timezone: "Asia/Kolkata"
});
