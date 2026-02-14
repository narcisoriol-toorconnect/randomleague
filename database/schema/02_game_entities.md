# Abstract Schema: Game Entities

This document defines the core data structures for the gameplay loop: Players, Squads, and Scoring.

## 1. Entities

### `players`
**Purpose**: The master list of all available footballers in La Liga.
- `id` (Primary Key): Unique identifier (e.g., Transfermarkt ID or UUID).
- `name` (String): Full name.
- `team` (String): Real-world club (e.g., "Real Madrid").
- `position` (Enum): 'GK', 'DEF', 'MID', 'FWD'.
- `market_value` (Decimal): Current price in Euros.
- `photo_url` (String, Optional): Link to headshot.
- `is_active` (Boolean): If false, player has left the league (cannot be drafted).

### `squads`
**Purpose**: Represents a user's team for a specific matchday.
- `id` (Primary Key): Unique identifier.
- `user_id` (Foreign Key -> `users.id`): The owner.
- `matchday` (Integer): The round this squad is valid for.
- `formation` (String): e.g., "4-4-2".
- `tactics` (JSON, Optional): Future-proofing for captain selection, etc.
- `is_valid` (Boolean): True if the squad has 11 starters + valid formation.

### `squad_players` (Junction Table)
**Purpose**: Links players to a squad.
- `squad_id` (Foreign Key -> `squads.id`)
- `player_id` (Foreign Key -> `players.id`)
- `is_starter` (Boolean): True = Scoring player, False = Bench.
- `is_captain` (Boolean): True = Double points.

### `matches`
**Purpose**: Real-world La Liga fixtures.
- `id` (Primary Key): Unique match ID.
- `matchday` (Integer): e.g., 5.
- `home_team` (String): "Barcelona".
- `away_team` (String): "Girona".
- `score_home` (Integer): Goals scored.
- `score_away` (Integer): Goals scored.
- `date` (Timestamp): Kickoff time.
- `status` (Enum): 'SCHEDULED', 'LIVE', 'FINISHED'.

### `player_stats`
**Purpose**: Performance data for a specific player in a specific match.
- `id` (Primary Key)
- `player_id` (Foreign Key -> `players.id`)
- `match_id` (Foreign Key -> `matches.id`)
- `minutes_played` (Integer)
- `goals` (Integer)
- `assists` (Integer)
- `yellow_cards` (Integer)
- `red_cards` (Integer)
- `fantasy_points` (Integer): calculated score for this game.

## 2. Relationships
- A `squad` has exactly 15 `squad_players` (11 starters + 4 bench).
- A `player` can be in multiple `squads` (unless constrained by league rules to be exclusive).
- `player_stats` links a real-world match performance to a player definition.

## 3. Constraints
- **Unique Squad per User/Matchday**: A user can only have one active squad for a given round.
- **Formation Integrity**: A squad must adhere to the rules of its chosen formation (e.g. 4 defenders for 4-4-2).
- **Captain Uniqueness**: Only one player in a squad can be captain.
