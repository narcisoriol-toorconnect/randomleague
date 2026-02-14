import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const BASE_URL = 'https://www.transfermarkt.com';
const LA_LIGA_URL = `${BASE_URL}/laliga/startseite/wettbewerb/ES1/saison_id/2025`;

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Upgrade-Insecure-Requests': '1'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function normalizePosition(tmPosition) {
    const pos = tmPosition.trim();
    if (pos.includes('Goalkeeper')) return 'GK';
    if (pos.includes('Back') || pos.includes('Sweeper')) return 'DEF';
    if (pos.includes('Midfield')) return 'MID';
    if (pos.includes('Winger') || pos.includes('Forward') || pos.includes('Striker')) return 'FWD';
    return 'MID'; // Default fallback
}

function parseMarketValue(mvString) {
    if (!mvString || mvString.includes('-')) return 0;

    const clean = mvString.replace('€', '').trim();
    let value = parseFloat(clean);

    if (clean.endsWith('m')) {
        return Math.round(value * 1000000);
    } else if (clean.endsWith('k')) {
        return Math.round(value * 1000);
    }

    return Math.round(value);
}

const CLUBS = [
    { "name": "Real Madrid", "url": "https://www.transfermarkt.com/real-madrid/kader/verein/418/saison_id/2025" },
    { "name": "FC Barcelona", "url": "https://www.transfermarkt.com/fc-barcelona/kader/verein/131/saison_id/2025" },
    { "name": "Atlético de Madrid", "url": "https://www.transfermarkt.com/atletico-de-madrid/kader/verein/13/saison_id/2025" },
    { "name": "Athletic Bilbao", "url": "https://www.transfermarkt.com/athletic-bilbao/kader/verein/621/saison_id/2025" },
    { "name": "Villarreal CF", "url": "https://www.transfermarkt.com/villarreal-cf/kader/verein/1050/saison_id/2025" },
    { "name": "Real Sociedad", "url": "https://www.transfermarkt.com/real-sociedad/kader/verein/681/saison_id/2025" },
    { "name": "Real Betis Balompié", "url": "https://www.transfermarkt.com/real-betis-balompie/kader/verein/150/saison_id/2025" },
    { "name": "Valencia CF", "url": "https://www.transfermarkt.com/valencia-cf/kader/verein/1049/saison_id/2025" },
    { "name": "Girona FC", "url": "https://www.transfermarkt.com/girona-fc/kader/verein/12321/saison_id/2025" },
    { "name": "Celta de Vigo", "url": "https://www.transfermarkt.com/celta-de-vigo/kader/verein/940/saison_id/2025" },
    { "name": "Sevilla FC", "url": "https://www.transfermarkt.com/sevilla-fc/kader/verein/368/saison_id/2025" },
    { "name": "RCD Espanyol Barcelona", "url": "https://www.transfermarkt.com/rcd-espanyol-barcelona/kader/verein/714/saison_id/2025" },
    { "name": "Rayo Vallecano", "url": "https://www.transfermarkt.com/rayo-vallecano/kader/verein/367/saison_id/2025" },
    { "name": "CA Osasuna", "url": "https://www.transfermarkt.com/ca-osasuna/kader/verein/331/saison_id/2025" },
    { "name": "Elche CF", "url": "https://www.transfermarkt.com/elche-cf/kader/verein/1531/saison_id/2025" },
    { "name": "Levante UD", "url": "https://www.transfermarkt.com/levante-ud/kader/verein/3368/saison_id/2025" },
    { "name": "RCD Mallorca", "url": "https://www.transfermarkt.com/rcd-mallorca/kader/verein/237/saison_id/2025" },
    { "name": "Getafe CF", "url": "https://www.transfermarkt.com/getafe-cf/kader/verein/3709/saison_id/2025" },
    { "name": "Real Oviedo", "url": "https://www.transfermarkt.com/real-oviedo/kader/verein/2497/saison_id/2025" },
    { "name": "Deportivo Alavés", "url": "https://www.transfermarkt.com/deportivo-alaves/kader/verein/1108/saison_id/2025" }
];

async function getClubs() {
    console.log('Using pre-extracted club list...');
    return CLUBS;
}

async function getPlayers(club) {
    console.log(`Scraping players for ${club.name}...`);
    try {
        const response = await axios.get(club.url, { headers: HEADERS });
        const $ = cheerio.load(response.data);

        // Club logo is in the header, often in data-header__profile-container
        const teamLogoUrl = $('div.data-header__profile-container img').attr('src') ||
            $('div.header-foto img').attr('src');

        const players = [];

        // Updated selector to be more robust
        $('table.items tr.odd, table.items tr.even').each((i, el) => {
            const nameEl = $(el).find('td.hauptlink a').first();
            const name = nameEl.text().trim();
            const profileUrl = nameEl.attr('href');

            if (!name || !profileUrl) return;

            const idMatch = profileUrl.match(/spieler\/(\d+)/);
            const externalId = idMatch ? `tm-${idMatch[1]}` : null;

            // Position is in the second row of the nested inline-table
            const positionText = $(el).find('.inline-table tr').last().text().trim();

            const position = normalizePosition(positionText);

            const marketValueText = $(el).find('td.rechts.hauptlink a').text().trim();
            const marketValue = parseMarketValue(marketValueText);

            const imgEl = $(el).find('td.zentriert img.bilderrahmen-fixed');
            const photoUrl = imgEl.attr('data-src') || imgEl.attr('src');

            // Detect availability (injury or suspension)
            const isInjured = $(el).find('td.hauptlink a span.verletzt-table').length > 0;
            const isSuspended = $(el).find('td.hauptlink a span.svg-icon').length > 0 ||
                $(el).find('td.hauptlink a span.suspension-icon').length > 0;
            const isUnavailable = isInjured || isSuspended;

            if (externalId) {
                players.push({
                    external_id: externalId,
                    name,
                    position,
                    market_value_eur: marketValue,
                    team_name: club.name,
                    photo_url: photoUrl,
                    team_logo_url: teamLogoUrl,
                    is_unavailable: isUnavailable
                });
            }
        });

        console.log(`Extracted ${players.length} players from ${club.name}.`);
        return players;
    } catch (error) {
        console.error(`Error scraping ${club.name}: ${error.message}`);
        return [];
    }
}

async function main() {
    try {
        const clubs = await getClubs();
        let allPlayers = [];

        for (const club of clubs) {
            const players = await getPlayers(club);
            allPlayers = allPlayers.concat(players);
            // Smaller delay since we are already being careful
            await sleep(1500);
        }

        await fs.writeFile('players.json', JSON.stringify(allPlayers, null, 2));
        console.log(`Successfully scraped ${allPlayers.length} players. Data saved to players.json`);
    } catch (error) {
        console.error(`Main execution error: ${error.message}`);
    }
}

main();
