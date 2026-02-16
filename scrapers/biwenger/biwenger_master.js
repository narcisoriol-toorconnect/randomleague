import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const BASE_URL = 'https://biwenger.as.com/blog/equipos/';
const JORNADA_LIST_URL = 'https://biwenger.as.com/blog/alineaciones-posibles-jornada/';
const JORNADA_BASE_URL = 'https://biwenger.as.com/blog/partidos/2025-2026/';

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
};

const CLUBS = [
    //{ name: 'Alavés', slug: 'alaves' },
    //{ name: 'Athletic', slug: 'athletic' },
    //{ name: 'Atlético', slug: 'atletico' },
    //{ name: 'Barcelona', slug: 'barcelona' },
    //{ name: 'Betis', slug: 'betis' },
    //{ name: 'Celta', slug: 'celta' },
    //{ name: 'Elche', slug: 'elche' },
    //{ name: 'Espanyol', slug: 'espanyol' },
    //{ name: 'Getafe', slug: 'getafe' },
    //{ name: 'Girona', slug: 'girona' },
    //{ name: 'Levante', slug: 'levante' },
    //{ name: 'Mallorca', slug: 'mallorca' },
    //{ name: 'Osasuna', slug: 'osasuna' },
    //{ name: 'Rayo Vallecano', slug: 'rayo-vallecano' },
    //{ name: 'Real Madrid', slug: 'real-madrid' },
    //{ name: 'Real Oviedo', slug: 'real-oviedo' },
    //{ name: 'Real Sociedad', slug: 'real-sociedad' },
    //{ name: 'Sevilla', slug: 'sevilla' },
    //{ name: 'Valencia', slug: 'valencia' },
    { name: 'Villarreal', slug: 'villarreal' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function normalizePosition(text) {
    const t = text.toUpperCase();
    if (t.includes('PT') || t.includes('PORTERO')) return 'GK';
    if (t.includes('DF') || t.includes('DEFENSA')) return 'DEF';
    if (t.includes('MC') || t.includes('CENTROCAMPISTA')) return 'MID';
    if (t.includes('DL') || t.includes('DELANTERO')) return 'FWD';
    return text;
}

function parsePrice(text) {
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
}

async function getPlayerPerformance(profileUrl) {
    if (!profileUrl) return [];
    try {
        const response = await axios.get(profileUrl, { headers: HEADERS, timeout: 10000 });
        const $ = cheerio.load(response.data);
        const matchHistory = [];

        $('.row.player-games-points').each((i, el) => {
            const jornada = $(el).find('.match-round a').text().trim();
            const pointsText = $(el).find('.score.score3 .points').text().trim();
            const points = parseInt(pointsText);

            if (jornada && !isNaN(points)) {
                const jornadaId = jornada.toLowerCase().split('(')[0].trim().replace(/\s+/g, '-');
                matchHistory.push({ jornada_id: jornadaId, points });
            } else if (jornada && $(el).text().toLowerCase().includes('no jugó')) {
                const jornadaId = jornada.toLowerCase().split('(')[0].trim().replace(/\s+/g, '-');
                matchHistory.push({ jornada_id: jornadaId, points: 0 });
            }
        });
        return matchHistory;
    } catch (error) {
        return [];
    }
}

async function scrapeJornadaList() {
    console.log(`Fetching Jornada list...`);
    try {
        const response = await axios.get(JORNADA_LIST_URL, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const jornadas = [];
        $('select option').each((i, el) => {
            const name = $(el).text().trim();
            const value = $(el).attr('value');
            if (value && value.includes('jornada-')) {
                const slug = value.split('/').filter(Boolean).pop();
                jornadas.push({ name, slug });
            }
        });
        return jornadas;
    } catch (error) {
        console.error(`Error fetching jornadas list: ${error.message}`);
        return [];
    }
}

async function scrapeJornadaDetails(jornada) {
    const url = `${JORNADA_BASE_URL}${jornada.slug}/`;
    try {
        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const matches = [];
        $('div[itemprop="subEvent"]').each((i, el) => {
            const homeName = $(el).find('div[itemprop="homeTeam"] h4[itemprop="name"]').text().trim();
            const awayName = $(el).find('div[itemprop="awayTeam"] h4[itemprop="name"]').text().trim();
            if (!homeName || !awayName) return;
            const scoreText = $(el).find('.match-status').text().trim();
            const matchDate = $(el).find('.match-date').text().replace(/\s+/g, ' ').trim();
            const matchUrl = $(el).find('a[itemprop="url"]').attr('href');
            matches.push({ home_team: homeName, away_team: awayName, score: scoreText || 'Scheduled', date: matchDate, match_url: matchUrl });
        });
        return matches;
    } catch (error) {
        return [];
    }
}

async function scrapeClubData(club) {
    const url = `${BASE_URL}${club.slug}/`;
    console.log(`Scraping club ${club.name}...`);
    try {
        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);

        // Team Metadata
        const logoUrl = $('.player-profile-leftside img.main-img').attr('src') || $('.team-summary .team-logo img').attr('src') || $('.team-header img').attr('src');
        let coachName = '';

        // Find coach in the squad list (usually has an "E" label or in a specific row)
        $('div[itemprop="athlete"]').each((i, el) => {
            const pos = $(el).find('.player-position').text().trim();
            if (pos.toUpperCase() === 'E' || pos.toUpperCase().includes('ENTRENADOR')) {
                coachName = $(el).find('h3 a').text().trim();
            }
        });

        const teamInfo = {
            id: club.slug,
            name: club.name,
            logo_url: logoUrl,
            coach: coachName
        };

        const players = [];
        const probableStarterSlugs = new Set();
        // Fix: Use the correct selector found in the provided HTML snippet
        $('#lineup .field.football').first().find('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                const slug = href.split('/').filter(Boolean).pop();
                probableStarterSlugs.add(slug);
            }
        });

        $('div[itemprop="athlete"]').each((i, el) => {
            const nameEl = $(el).find('h3 a').first();
            const name = nameEl.text().trim();
            const profileUrl = nameEl.attr('href');
            if (!name) return;

            const playerSlug = profileUrl ? profileUrl.split('/').filter(Boolean).pop() : '';
            const isLikelyStarter = probableStarterSlugs.has(playerSlug);

            players.push({
                external_id: profileUrl ? `biw-${playerSlug}` : `biw-${name.toLowerCase().replace(/\s+/g, '-')}`,
                name,
                position: normalizePosition($(el).find('.player-position').text().trim()),
                market_value_eur: parsePrice($(el).find('.price').text().trim()),
                team_id: club.slug,
                photo_url: $(el).find('.photo img').attr('src'),
                is_unavailable: $(el).find('.player-status').hasClass('injured') || $(el).find('.player-status').hasClass('suspended') || $(el).find('.player-status').text().includes('Duda'),
                availability_detail: $(el).find('.player-status').text().replace(/-/g, '').replace(/\s+/g, ' ').trim() || 'Available',
                posible_titular: isLikelyStarter,
                profile_url: profileUrl
            });
        });

        for (let player of players) {
            console.log(`  Enriching ${player.name}...`);
            player.match_history = await getPlayerPerformance(player.profile_url);
            delete player.profile_url;
            await sleep(100);
        }

        return { team: teamInfo, players };
    } catch (error) {
        console.error(`Error scraping ${club.name}: ${error.message}`);
        return { team: null, players: [] };
    }
}

async function main() {
    const masterData = {
        teams: [],
        players: [],
        jornadas: []
    };

    // 1. Scrape Jornadas
    const jornadaList = await scrapeJornadaList();
    const jornadasMap = new Map();
    for (const jornada of jornadaList) {
        console.log(`Scraping Jornada ${jornada.name}...`);
        const matches = await scrapeJornadaDetails(jornada);
        const normalizedName = jornada.name.replace(/\s*\(aplazada\)\s*/i, '').trim();
        if (!jornadasMap.has(normalizedName)) {
            jornadasMap.set(normalizedName, {
                id: normalizedName.toLowerCase().replace(/\s+/g, '-'),
                name: normalizedName,
                matches: []
            });
        }
        jornadasMap.get(normalizedName).matches.push(...matches);
        await sleep(500);
    }
    masterData.jornadas = Array.from(jornadasMap.values());

    // 2. Scrape Clubs and Players
    for (const club of CLUBS) {
        const { team, players } = await scrapeClubData(club);
        if (team) masterData.teams.push(team);
        masterData.players.push(...players);
        await sleep(500);
    }

    await fs.writeFile('master_biwenger.json', JSON.stringify(masterData, null, 2));
    console.log(`DONE! Master data saved to master_biwenger.json`);
}

main();
