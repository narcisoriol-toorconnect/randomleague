import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const BASE_URL = 'https://biwenger.as.com/blog/partidos/2025-2026/';
const DROPDOWN_URL = 'https://biwenger.as.com/blog/alineaciones-posibles-jornada/';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getJornadaList() {
    console.log(`Fetching Jornada list from ${DROPDOWN_URL}...`);
    try {
        const response = await axios.get(DROPDOWN_URL, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const jornadas = [];

        $('select option').each((i, el) => {
            const name = $(el).text().trim();
            const value = $(el).attr('value'); // e.g. "https://biwenger.as.com/blog/partidos/2025-2026/jornada-24/"

            if (value && value.includes('jornada-')) {
                const slug = value.split('/').filter(Boolean).pop();
                jornadas.push({ name, slug });
            }
        });

        console.log(`Found ${jornadas.length} jornadas.`);
        return jornadas;
    } catch (error) {
        console.error(`Error fetching jornadas: ${error.message}`);
        return [];
    }
}

async function scrapeJornada(jornada) {
    const url = `${BASE_URL}${jornada.slug}/`;
    console.log(`Scraping ${jornada.name} from ${url}...`);

    try {
        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const matches = [];

        // In matchday pages, matches are in items with itemprop="subEvent"
        $('div[itemprop="subEvent"]').each((i, el) => {
            const homeTeamEl = $(el).find('div[itemprop="homeTeam"]');
            const awayTeamEl = $(el).find('div[itemprop="awayTeam"]');

            const homeName = homeTeamEl.find('h4[itemprop="name"]').text().trim();
            const awayName = awayTeamEl.find('h4[itemprop="name"]').text().trim();

            if (!homeName || !awayName) return;

            const scoreText = $(el).find('.match-status').text().trim();
            const matchDate = $(el).find('.match-date').text().replace(/\s+/g, ' ').trim();
            const matchUrl = $(el).find('a[itemprop="url"]').attr('href');

            matches.push({
                jornada: jornada.name,
                home_team: homeName,
                away_team: awayName,
                score: scoreText || 'Scheduled',
                date: matchDate,
                match_url: matchUrl
            });
        });

        console.log(`  Extracted ${matches.length} matches.`);
        return matches;
    } catch (error) {
        console.error(`Error scraping ${jornada.name}: ${error.message}`);
        return [];
    }
}

async function main() {
    try {
        const jornadasList = await getJornadaList();
        const jornadasMap = new Map();

        for (const jornada of jornadasList) {
            const matches = await scrapeJornada(jornada);
            if (matches.length > 0) {
                // Normalize "Jornada X (aplazada)" to "Jornada X"
                const normalizedName = jornada.name.replace(/\s*\(aplazada\)\s*/i, '').trim();

                if (!jornadasMap.has(normalizedName)) {
                    const id = normalizedName.toLowerCase().replace(/\s+/g, '-');
                    jornadasMap.set(normalizedName, {
                        id,
                        jornada: normalizedName,
                        matches: []
                    });
                }

                const entry = jornadasMap.get(normalizedName);
                entry.matches.push(...matches.map(m => {
                    const { jornada: _, ...matchData } = m; // Remove redundant jornada name from individual match
                    return matchData;
                }));
            }
            await sleep(500);
        }

        const structuredJornadas = Array.from(jornadasMap.values());
        await fs.writeFile('jornadas_biwenger.json', JSON.stringify(structuredJornadas, null, 2));
        console.log(`Successfully scraped and merged ${structuredJornadas.length} jornadas. Data saved to jornadas_biwenger.json`);
    } catch (error) {
        console.error(`Main execution error: ${error.message}`);
    }
}

main();
