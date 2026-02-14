# 🕷️ Scraper Tool: Transfermarkt

**Mission**: Standardized acquisition of the La Liga player pool.

## 1. Responsibilities
This tool is a standalone data fetcher. It visits Transfermarkt to extract the "Identity" and "Market Value" of players.

- **Entity Discovery**: Find all clubs in the current La Liga season.
- **Player Extraction**: For each club, gather the full roster.
- **Data Points**:
    - Full Name.
    - Official Position (mapped to GK, DEF, MID, FWD).
    - Market Value (extracted as numerical millions).
    - **Photo URL**: Direct link to the player's headshot.
    - **Club Logo URL**: Direct link to the team crest.

---

## 2. Output Contract (JSON)
The tool must output an array of objects in the following format:

```json
[
  {
    "external_id": "tm-12345",
    "name": "Lamine Yamal",
    "position": "FWD",
    "market_value_eur": 120000000,
    "team_name": "FC Barcelona",
    "photo_url": "https://tm.images/lamine.jpg",
    "team_logo_url": "https://tm.images/barca_crest.png",
    "is_unavailable": false
  }
]
```

---

## 3. Implementation Strategy
- **Crawl Path**: Start at the La Liga "Clubs" overview page -> Iterate through Squad pages.
- **Extraction**: User-Agent rotation and request throttling to avoid IP blocks.
- **Normalization**: Positions like "Right Winger" or "Second Striker" must be normalized to our 4 core positions (GK, DEF, MID, FWD).
