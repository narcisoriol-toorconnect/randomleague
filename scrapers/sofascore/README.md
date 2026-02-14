# 🕷️ Scraper Tool: SofaScore

**Mission**: Standardized acquisition of live matchday performance and player status.

## 1. Responsibilities
This tool focuses on the "Dynamic" data of the league. It extracts how players performed and whether they are currently healthy.

- **Performance Tracking**: Extract the official 0-10 match rating.
- **Event Statistics**: Capture Goals, Assists, Minutes Played, and Disciplinary cards.
- **Health Status**: Identify current injuries, suspensions, or other absences.
- **Match Results**: Capture scores and team participation.

---

## 2. Output Contract (JSON)

### 2.1 Match Results
```json
[
  {
    "match_id": "ss-998",
    "matchday": 5,
    "home_team": "Real Madrid",
    "away_team": "Espanyol",
    "score_home": 4,
    "score_away": 1,
    "status": "FINISHED"
  }
]
```

### 2.2 Player Performances
```json
[
  {
    "player_external_id": "ss-776",
    "rating": 8.4,
    "stats": {
      "minutes_played": 90,
      "goals": 1,
      "assists": 1,
      "yellow_cards": 0,
      "red_cards": 0,
      "penalty_saved": 0,
      "penalty_missed": 0,
      "own_goals": 0
    },
    "availability": {
        "status": "AVAILABLE",
        "detail": null
    }
  }
]
```

---

## 3. Implementation Strategy
- **Source**: Matchday overview or specific Match-details endpoints.
- **Status Mapping**: Map SofaScore injury icons/text to our internal statuses (`AVAILABLE`, `INJURED`, `SUSPENDED`).
