# 🕷️ Scrapers (Block E)

**Responsibility**: Data Ingestion.

This directory contains standalone tools designed to extract information from external sources. These tools are decoupled from the game logic; their only mission is to fetch, normalize, and provide data for the Database layer.

---

## 🛠 Required Scraper Tools

### 1. **[Player Pool Tool](./transfermarkt/README.md)** (Source: Transfermarkt)
**Mission**: Scrape the foundational library of football players.
- **Goal**: Fetch every player's Name, Position, Market Value, and Photo URL.
- **Context**: Focuses on the "Economic" and "Identity" data of the league.

### 2. **[Matchday Data Tool](./sofascore/README.md)** (Source: SofaScore)
**Mission**: Scrape performance metrics and player status.
- **Goal**: Fetch the 0-10 Rating, Match Stats (Goals, Assists, etc.), and current Availability (Injuries/Suspensions).
- **Context**: Focuses on the "Performance" and "Health" data of the league.