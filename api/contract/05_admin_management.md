# API Contract: Admin Management

This document defines the privileged operations restricted to the League Organizer (Admin role).

## 1. League Control

### `POST /admin/league/reset`
**Purpose**: Wipe all squads and rankings to start a new season.
- **Inputs**: `confirmation_key`.
- **Outputs**: `Success`.

### `POST /admin/league/randomize`
**Purpose**: Trigger the Randomizer Engine to assign new players for the upcoming matchday.
- **Inputs**: `valuation_limit` (optional override), `position_requirements` (optional override).
- **Outputs**: `Success`. (Asynchronous: Broadcasts `NEW_TEAM` notification when done).

### `PATCH /admin/league/lock`
**Purpose**: Manually toggle the squad editing lock state.
- **Inputs**: `is_locked` (boolean).
- **Outputs**: New state status.

## 2. User & Content Management

### `POST /admin/users`
**Purpose**: Manually register a new participant.
- **Inputs**: `email`, `display_name`, `temp_password`.
- **Outputs**: `user_id`.

### `DELETE /admin/forum/posts/{post_id}`
**Purpose**: Moderator action to remove offensive content.
- **Inputs**: `post_id`.
- **Outputs**: `Success`.

## 3. Manual Squad Adjustments (Transfers)

### `POST /admin/squads/{user_id}/players`
**Purpose**: Manually add a specific football player to a user's squad (Requirement ADM-08).
- **Inputs**: `player_id`.
- **Outputs**: `Success`.

### `DELETE /admin/squads/{user_id}/players/{player_id}`
**Purpose**: Manually remove a specific football player from a user's squad (Requirement ADM-08).
- **Inputs**: `player_id`.
- **Outputs**: `Success`.

## 4. Scoring Overrides

### `POST /admin/rankings/{user_id}/adjust`
**Purpose**: Apply a manual point adjustment to a user's matchday score (Requirement SCORE-08).
- **Inputs**: `user_id`, `matchday`, `points_delta` (integer), `reason`.
- **Outputs**: `Success`, recalculated ranking.
