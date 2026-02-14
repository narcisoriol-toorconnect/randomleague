# Abstract Schema: Rankings & Notifications

This document defines how the system tracks progress over time and keeps users informed.

## 1. Entities

### `rankings_history`
**Purpose**: Stores a snapshot of the leaderboard at the end of every matchday. This allows users to see their progress over the season.
- `id` (Primary Key).
- `user_id` (Foreign Key -> `users.id`).
- `matchday_id` (Integer): The round this snapshot represents.
- `points_matchday` (Integer): Points earned from squad players in this round.
- `points_adjustment` (Integer, Default: 0): Admin-applied manual correction.
- `adjustment_reason` (String, Optional): Explanation for the manual change.
- `points_total` (Integer): Accumulated points up to this round (including adjustments).
- `rank` (Integer): The user's position in the league after this round.

### `notifications`
**Purpose**: Stores a history of alerts sent to the user. This acts as an "Inbox" within the app.
- `id` (Primary Key).
- `user_id` (Foreign Key -> `users.id`): Recipient.
- `title` (String): Short headline.
- `body` (Text): The full message content.
- `type` (Enum): 
    - `SQUAD_LOCK`: Reminder before matchday.
    - `NEW_TEAM`: Randomization complete.
    - `RESULTS`: Points published.
    - `SOCIAL`: Forum mentions/replies.
    - `ADMIN`: Manual announcement.
- `is_read` (Boolean): For the in-app unread indicator.
- `created_at` (Timestamp).

## 2. Relationships
- Both tables are linked directly to `users`.
- `rankings_history` is typically populated by the **Scoring Engine** after all matches for a round are processed.

## 3. Constraints
- **Unique Ranking Entry**: A user should have only one entry for a specific matchday in `rankings_history`.
- **Retention Policy**: Notifications might need a cleanup period (e.g., delete older than 30 days) to keep the DB light.
