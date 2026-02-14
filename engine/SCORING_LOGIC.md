# 🧮 Scoring Engine — Technical Specification

This document defines the logic and formula used to calculate fantasy points for the Random League.

## 1. Engine Archetype: The "Matchday Processor"
The Scoring Engine is an automated process that runs after matchday data is collected. It converts real-world statistics and ratings into a final score for each participant.

---

## 2. Data Contract

### 2.1 Inputs
The engine expects structured data from the Database/Scrapers:

| Name | Type | Description |
| :--- | :--- | :--- |
| `raw_player_performances` | `List[Object]` | Array of `{ player_id, rating, goals, assists, mins_played, yellow_card, red_card, penalty_saved, penalty_missed, own_goal, plays_for_team_id }`. |
| `match_results` | `List[Object]` | Array of `{ team_id, goals_conceded }` to determine Clean Sheets. |
| `user_squads` | `List[Object]` | Array of `{ user_id, captain_id, starter_ids[] }`. |
| `scoring_config` | `JSON` | The points table defined in Section 3. |

### 2.2 Outputs
The engine returns two primary data sets:

| Name | Type | Description |
| :--- | :--- | :--- |
| `player_jornada_points` | `Map[ID, Int]` | Final points calculated for every individual player. |
| `user_jornada_totals` | `Map[ID, Int]` | Final sum for each user (Starters only + Captain bonus). |

---

## 3. The Hybrid Formula

The total points for an individual football player in a matchday is calculated as:
**`Total_Points = Base_Rating + Activity_Bonuses - Penalties`**

### 2.1 Base Point Source
- **SofaScore Rating**: The direct numerical rating (0-10) provided by the official match data.

### 2.2 Activity Bonuses (The "Fantasy" Feel)
| Action | Points | Condition |
| :--- | :--- | :--- |
| **Participation** | **+1** | Player played 60 or more minutes in the match. |
| **Scoring (Goal)** | **+3** | Per goal scored. |
| **Assist** | **+2** | Per official assist. |
| **Clean Sheet** | **+2** | GK and DEF only. Must play at least 60 mins. |
| **Penalty Save** | **+3** | GK only. |

### 2.3 Penalties
| Action | Points |
| :--- | :--- |
| **Yellow Card** | **-1** |
| **Red Card** | **-3** |
| **Own Goal** | **-2** |
| **Penalty Miss** | **-2** |

---

## 3. Team Calculation (User Level)

The final score for a **User** for a given matchday is the sum of the points of their **11 selected starters**.

### 3.1 The Captain Rule
- One designated player is the **Captain**.
- **`Captain_Points = (Individual_Player_Points) * 2`**

### 3.2 Bench Players
- Players in the squad pool (4 players) who were **not** selected in the starting 11 earn **0 points**, regardless of their real-world performance.

### 3.3 Manual Overrides
- The Admin can apply a flat `points_adjustment` (integer) to the User's matchday total. This is added after the engine has calculated the squad total.

---

## 4. Execution Workflow
1.  **Ingestion**: Scrapers fetch raw match stats and ratings for all La Liga players.
2.  **Point Calculation**: For every player in the DB, calculate their individual fantasy score using the table above.
3.  **Squad Summation**: For every active squad, identify the 11 starters and the captain.
4.  **Persistence**:
    - Write individual breakdown to `player_stats`.
    - Update `rankings_history` with the user's matchday total.
    - Refresh the league leaderboard.
