# Abstract Schema: Users & League Configuration

This document defines the core entities for User Management and League State in a relational format, agnostic of the specific SQL dialect.

## 1. Entities

### `users`
**Purpose**: Stores the identity of every participant in the league.
- `id` (Primary Key): Unique identifier (UUID).
- `email` (String, Unique): User's login email.
- `username` (String, Unique): Display name in the league.
- `avatar_url` (String, Optional): Link to profile picture.
- `role` (Enum): Authorization level.
    - `ADMIN`: Can manage league, users, and trigger resets.
    - `USER`: Regular participant.
- `notification_preferences` (JSON, Optional): Maps keys (e.g., 'FORUM', 'SQUAD_LOCK') to boolean preferences.
- `created_at` (Timestamp): When the user joined.

### `league_settings`
**Purpose**: Stores global configuration and state. There should only be **one row** in this table.
- `id` (Primary Key): Singleton ID (e.g., 1).
- `is_locked` (Boolean): Global switch for squad editing.
- `current_matchday` (Integer): The active La Liga round (e.g., 1-38).
- `season_year` (String): e.g., "2025/2026".
- `valuation_limit` (Decimal): Global budget cap for randomization (e.g. 200M).
- `position_requirements` (JSON): Logic for squad counts (e.g. {"GK": 2, "DEF": 5, "MID": 5, "FWD": 3}).
- `last_updated` (Timestamp): When the state last changed.

## 2. Relationships
- A `user` exists independently.
- `league_settings` is a singleton and has no foreign keys.

## 3. Constraints & Business Rules
- **Unique Email/Username**: No two users can have the same identifier.
- **Single Settings Row**: The system must enforce that `league_settings` contains exactly one active configuration row.
