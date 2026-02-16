import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const BASE_URL = 'https://biwenger.as.com/blog/equipos/';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function normalizePosition(biwengerPos) {
    const pos = biwengerPos.trim().toUpperCase();
    if (pos.includes('PT')) return 'GK';
    if (pos.includes('DF')) return 'DEF';
    if (pos.includes('MC')) return 'MID';
    if (pos.includes('DL')) return 'FWD';
    return 'MID';
}

function parsePrice(priceString) {
    if (!priceString) return 0;
    // Remove dots and Euro symbol: "30.240.000 €" -> 30240000
    const clean = priceString.replace(/\./g, '').replace('€', '').trim();
    return parseInt(clean) || 0;
}

const CLUBS = [
    { name: "Alavés", slug: "alaves" },
    { name: "Athletic", slug: "athletic" },
    { name: "Atlético", slug: "atletico" },
    { name: "Barcelona", slug: "barcelona" },
    { name: "Betis", slug: "betis" },
    { name: "Celta", slug: "celta" },
    { name: "Elche", slug: "elche" },
    { name: "Espanyol", slug: "espanyol" },
    { name: "Getafe", slug: "getafe" },
    { name: "Girona", slug: "girona" },
    { name: "Levante", slug: "levante" },
    { name: "Mallorca", slug: "mallorca" },
    { name: "Osasuna", slug: "osasuna" },
    { name: "Rayo Vallecano", slug: "rayo-vallecano" },
    { name: "Real Madrid", slug: "real-madrid" },
    { name: "Real Oviedo", slug: "real-oviedo" },
    { name: "Real Sociedad", slug: "real-sociedad" },
    { name: "Sevilla", slug: "sevilla" },
    { name: "Valencia", slug: "valencia" },
    { name: "Villarreal", slug: "villarreal" }
];

async function getPlayerPerformance(profileUrl) {
    if (!profileUrl) return [];

    try {
        const response = await axios.get(profileUrl, {
            headers: HEADERS,
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        const matchHistory = [];

        // In player pages, matches are in rows with class .row.player-games-points
        $('.row.player-games-points').each((i, el) => {
            // Jornada is in .match-round a
            const jornada = $(el).find('.match-round a').text().trim();

            // Media AS y SofaScore is typically the .score.score3 element's .points span
            const pointsText = $(el).find('.score.score3 .points').text().trim();
            const points = parseInt(pointsText);

            if (jornada && !isNaN(points)) {
                // Normalize "Jornada 23 (aplazada)" or "Jornada 23" to "jornada-23"
                const jornadaId = jornada.toLowerCase().split('(')[0].trim().replace(/\s+/g, '-');

                matchHistory.push({
                    jornada_id: jornadaId,
                    points
                });
            } else if (jornada && $(el).text().toLowerCase().includes('no jugó')) {
                const jornadaId = jornada.toLowerCase().split('(')[0].trim().replace(/\s+/g, '-');
                matchHistory.push({
                    jornada_id: jornadaId,
                    points: 0
                });
            }
        });

        return matchHistory;
    } catch (error) {
        console.error(`Error fetching performance for ${profileUrl}: ${error.message}`);
        return [];
    }
}

async function getPlayers(club) {
    const url = `${BASE_URL}${club.slug}/`;
    console.log(`Scraping players for ${club.name} from ${url}...`);

    try {
        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const players = [];

        // In team pages, players are in div[itemprop="athlete"] blocks
        $('div[itemprop="athlete"]').each((i, el) => {
            const nameEl = $(el).find('h3 a').first();
            let name = nameEl.text().trim();
            const profileUrl = nameEl.attr('href');

            if (!name) return;

            const positionText = $(el).find('.player-position').text().trim();
            const position = normalizePosition(positionText);

            const priceText = $(el).find('.price').text().trim();
            const marketValue = parsePrice(priceText);

            const photoUrl = $(el).find('.photo img').attr('src');

            // Availability markers
            const statusEl = $(el).find('.player-status');
            let statusDetail = statusEl.text().replace(/\s+/g, ' ').trim();
            // Remove trailing dashes often found in Biwenger status text
            statusDetail = statusDetail.replace(/-+$/, '').trim();

            const isUnavailable = statusEl.hasClass('injured') ||
                statusEl.hasClass('suspended') ||
                statusDetail.toLowerCase().includes('lesionado') ||
                statusDetail.toLowerCase().includes('sancionado');

            const externalId = profileUrl ? `biw-${profileUrl.split('/').filter(Boolean).pop()}` : `biw-${name.toLowerCase().replace(/\s+/g, '-')}`;

            players.push({
                external_id: externalId,
                name,
                position,
                market_value_eur: marketValue,
                team_name: club.name,
                photo_url: photoUrl,
                is_unavailable: isUnavailable,
                availability_detail: statusDetail || 'Available',
                profile_url: profileUrl
            });
        });

        console.log(`Extracted ${players.length} basic info for players from ${club.name}.`);

        // Now enrich each player with match history
        for (let player of players) {
            console.log(`  Fetching match history for ${player.name}...`);
            player.match_history = await getPlayerPerformance(player.profile_url);
            delete player.profile_url; // Remove internal helper
            await sleep(100); // Throttling for detail pages
        }

        return players;
    } catch (error) {
        console.error(`Error scraping ${club.name}: ${error.message}`);
        return [];
    }
}

async function main() {
    try {
        let allPlayers = [];

        for (const club of CLUBS) {
            const players = await getPlayers(club);
            allPlayers = allPlayers.concat(players);
            await sleep(500);
        }

        await fs.writeFile('players_biwenger.json', JSON.stringify(allPlayers, null, 2));
        console.log(`Successfully enriched and scraped ${allPlayers.length} players. Data saved to players_biwenger.json`);
    } catch (error) {
        console.error(`Main execution error: ${error.message}`);
    }
}

main();
