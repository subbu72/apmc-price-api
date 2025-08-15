// scraper.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const { parse } = require('json2csv');

async function fetchAPMCPrices() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const url = 'https://agmarknet.gov.in/SearchCmmMkt.aspx';

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // TODO: Automate form selection (State, District, Commodity) here

        // Wait for table
        await page.waitForSelector('#cphBody_GridPriceData');

        const prices = await page.evaluate(() => {
            const data = [];
            const rows = document.querySelectorAll('#cphBody_GridPriceData tr');
            rows.forEach((row) => {
                const columns = row.querySelectorAll('td');
                if (columns.length > 0) {
                    data.push({
                        date: columns[0].innerText.trim(),
                        market: columns[1].innerText.trim(),
                        commodity: columns[2].innerText.trim(),
                        variety: columns[3].innerText.trim(),
                        grade: columns[4].innerText.trim(),
                        minPrice: columns[5].innerText.trim(),
                        maxPrice: columns[6].innerText.trim(),
                        modalPrice: columns[7].innerText.trim(),
                    });
                }
            });
            return data;
        });

        // Save JSON
        fs.writeFileSync('apmcData.json', JSON.stringify(prices, null, 2));

        // Save CSV
        const csv = parse(prices);
        fs.writeFileSync('apmc.csv', csv);

        console.log('✅ Saved apmcData.json and apmc.csv');
    } catch (error) {
        console.error('❌ Scraper error:', error.message);
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    fetchAPMCPrices();
}

module.exports = fetchAPMCPrices;
