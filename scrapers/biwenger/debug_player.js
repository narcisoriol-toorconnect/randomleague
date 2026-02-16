import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://biwenger.as.com/blog/jugadores/mbappe/';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
};

async function debug() {
    try {
        const response = await axios.get(URL, { headers: HEADERS });
        const $ = cheerio.load(response.data);

        console.log('Page Title:', $('title').text());

        const partidosDiv = $('#partidos');
        console.log('Found #partidos:', partidosDiv.length > 0);

        const rows = $('.row.player-games-points');
        console.log('Found .row.player-games-points count:', rows.length);

        if (rows.length > 0) {
            rows.each((i, el) => {
                if (i < 3) {
                    console.log(`Row ${i} HTML:`, $(el).html().substring(0, 200) + '...');
                    console.log(`Row ${i} Match Text:`, $(el).find('.match').text());
                    console.log(`Row ${i} Score3:`, $(el).find('.score.score3').text());
                }
            });
        } else {
            console.log('No rows found. Checking and listing all divs with id or class containing "partido" or "game":');
            $('[id*="partido"], [class*="partido"], [id*="game"], [class*="game"]').each((i, el) => {
                console.log(`ID: ${$(el).attr('id')}, Class: ${$(el).attr('class')}`);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

debug();
