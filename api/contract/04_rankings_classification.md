# API Contract: Rankings & Classification

This document defines the interface for viewing the competitive standing of the league.

## 1. Leaderboards

### `GET /rankings/current`
**Purpose**: Fetch the sorted list of participants and their total points.
- **Inputs**: None.
- **Outputs**: List of `ranking_objects`: (User_Summary, Total_Points, Rank, Rank_Change, Last_Matchday_Points).

### `GET /rankings/matchday/{matchday_number}`
**Purpose**: View the snapshot of the leaderboard at the end of a specific past round.
- **Inputs**: `matchday_number`.
- **Outputs**: Historical list of rankings.

## 2. Detailed Stats

### `GET /rankings/user/{user_id}/breakdown`
**Purpose**: See exactly how a user earned their points in the latest round.
- **Inputs**: `user_id`.
- **Outputs**: List of `player_stats` (Athlete Name, Points, Goals, etc.) for that user's squad.

### `GET /rankings/user/{user_id}/history`
**Purpose**: View a user's points progress over the season (chart data).
- **Inputs**: `user_id`.
- **Outputs**: List of (Matchday, Points, Rank).
