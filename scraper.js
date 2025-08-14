// scraper.js
const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchAPMCPrices() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // ✅ Use your desired APMC search result URL (with actual filters)
    const url = 'https://agmarknet.gov.in/SearchCmmMkt.aspx';

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Optionally fill form or apply filters here (if needed)

        // Wait for the table to load
        await page.waitForSelector('#cphBody_GridPriceData');

        const prices = await page.evaluate(() => {
            const data = [];
            const rows = document.querySelectorAll('#cphBody_GridPriceData tr');

            rows.forEach((row, index) => {
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

        fs.writeFileSync('apmcData.json', JSON.stringify(prices, null, 2));
        console.log('✅ APMC data saved to apmcData.json');
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
