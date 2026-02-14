# API Contract: League & Gameplay

This document defines the interface for the core fantasy soccer loop: Squad Selection and Knowledge of the Pool.

## 1. Squad Management

### `GET /squad/me`
**Purpose**: Fetch the user's currently assigned pool (15 players) and their saved starter 11.
- **Inputs**: None (uses Auth Token).
- **Outputs**: 
    - `player_pool`: List of 15 players (ID, Name, Position, Value, Team, PhotoURL, Status).
    - `selection`: Current 11 starters + Formation + Captain ID.
    - `is_locked`: Current league lock status.

### `POST /squad/save`
**Purpose**: Commit a specific 11-player lineup and formation.
- **Inputs**: 
    - `starter_ids`: List of 11 player IDs.
    - `formation_id`: e.g., "4-4-2".
    - `captain_id`: ID of the designated double-points player.
- **Outputs**: 
    - `Success`: Updated squad record.
    - `Error`: `league_locked`, `invalid_formation` (wrong position counts), `invalid_player_count`.

## 2. Player Market / Data

### `GET /market/players`
**Purpose**: Browse the global pool of all La Liga players (for general interest/future features).
- **Inputs**: `position` (optional filter), `search_query` (optional).
- **Outputs**: List of player entities.

### `GET /market/teams`
**Purpose**: List official La Liga clubs.
- **Inputs**: None.
- **Outputs**: List of teams (Name, Logo URL).
