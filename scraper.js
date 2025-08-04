// scraper.js
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Change the URL as needed — this one is for tomatoes in Bangalore
const url = 'https://agmarknet.gov.in/SearchCmmMkt.aspx?...'; // Replace with real final URL

async function fetchAPMCPrices() {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        let prices = [];

        $('table#cphBody_GridPriceData tr').each((index, row) => {
            const columns = $(row).find('td');
            if (columns.length > 0) {
                prices.push({
                    date: $(columns[0]).text().trim(),
                    market: $(columns[1]).text().trim(),
                    commodity: $(columns[2]).text().trim(),
                    variety: $(columns[3]).text().trim(),
                    grade: $(columns[4]).text().trim(),
                    minPrice: $(columns[5]).text().trim(),
                    maxPrice: $(columns[6]).text().trim(),
                    modalPrice: $(columns[7]).text().trim()
                });
            }
        });

        fs.writeFileSync('apmcData.json', JSON.stringify(prices, null, 2));
        console.log('✅ APMC data saved to apmcData.json');
    } catch (error) {
        console.error('❌ Error fetching APMC data:', error.message);
    }
}

// Only run when called directly
if (require.main === module) {
    fetchAPMCPrices();
}

module.exports = fetchAPMCPrices;
