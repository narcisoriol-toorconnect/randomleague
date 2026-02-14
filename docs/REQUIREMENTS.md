# 📋 Requirements — Random League

## Table of Contents

- [User Management](#1-user-management)
- [Authentication](#2-authentication)
- [Main Views](#3-main-views)
  - [Forum](#31-forum)
  - [Squad](#32-squad-selection)
  - [Classification](#33-classification--rankings)
- [League Lifecycle & Randomization](#4-league-lifecycle--randomization)
- [Admin Features](#5-admin-features)
- [Scoring System](#6-scoring-system)
- [External Data Sources](#7-external-data-sources)
- [Data & Backend](#8-data--backend)
- [Non-Functional Requirements](#9-non-functional-requirements)

---

## 1. User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| UM-01 | Users are **manually registered** by the admin (no self-registration) | Must |
| UM-02 | Each user has a unique username and password | Must |
| UM-03 | User profiles store: display name, avatar (optional), and email | Should |
| UM-04 | Admin can create, edit, and deactivate user accounts | Must |
| UM-05 | Users have one of two roles: **regular** or **admin** | Must |

---

## 2. Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | App displays a **login screen** as the entry point | Must |
| AUTH-02 | Users authenticate with username/email and password | Must |
| AUTH-03 | Session persists so users don't have to log in every time they open the app | Should |
| AUTH-04 | Logout option available from the app | Must |
| AUTH-05 | Password reset mechanism (admin-assisted or self-service) | Could |

---

## 3. Main Views

After login, the user accesses **three main views**, navigable via a bottom tab bar or similar navigation.

### 3.1 Forum

A social feed where participants interact, share content, and react to posts.

| ID | Requirement | Priority |
|----|-------------|----------|
| FORUM-01 | Users can create **text posts** | Must |
| FORUM-02 | Users can attach **images** to posts | Must |
| FORUM-03 | Posts are displayed in a **chronological feed** (newest first) | Must |
| FORUM-04 | Users can **react** to posts with emojis | Must |
| FORUM-05 | Users can **comment/reply** on posts | Should |
| FORUM-06 | The **admin or app server** can publish automated posts (e.g., match results, announcements) | Must |
| FORUM-07 | Users can delete their own posts | Should |
| FORUM-08 | Admin can delete any post (moderation) | Should |
| FORUM-09 | Push notifications for new posts or replies | Could |
| FORUM-10 | Support for basic text formatting (bold, italic) in posts | Could |

### 3.2 Squad Selection

Users select their starting 11 from a pool of 15 players and choose a tactical formation.

| ID | Requirement | Priority |
|----|-------------|----------|
| SQUAD-01 | Each user has a **pool of players** assigned to them | Must |
| SQUAD-02 | Users select **11 players** from their pool to form their squad | Must |
| SQUAD-03 | Users choose a **formation** (e.g., 4-3-3, 4-4-2, 3-5-2, etc.) | Must |
| SQUAD-04 | Squad is displayed visually in a **pitch/field layout** matching the chosen formation | Should |
| SQUAD-05 | Users can **save** their squad selection | Must |
| SQUAD-06 | Squad editing is **locked/unlocked** based on the league state (e.g., locked once matches start) | Must |
| SQUAD-07 | When squad editing is locked, a clear **visual indicator** is shown (e.g., banner, disabled buttons) | Must |
| SQUAD-08 | Admin controls the lock/unlock state of squad editing | Must |
| SQUAD-09 | Player cards show basic info: name, position, team, photo (optional) | Should |
| SQUAD-10 | Validation: users cannot save a squad with fewer/more than 11 players | Must |
| SQUAD-11 | Validation: formation must be compatible with selected player positions | Could |

### 3.3 Classification / Rankings

A leaderboard showing how each participant is performing in the league.

| ID | Requirement | Priority |
|----|-------------|----------|
| CLASS-01 | Display a **ranking table** with all participants | Must |
| CLASS-02 | Rankings show: position, user name, total points | Must |
| CLASS-03 | Rankings are sorted by **total points** (descending) | Must |
| CLASS-04 | Clicking on a user shows their **detailed stats / point breakdown** | Should |
| CLASS-05 | Rankings data is updated based on real match results (admin or backend manages scoring) | Must |
| CLASS-06 | Visual highlight for the **top 3** and **bottom positions** | Could |
| CLASS-07 | Historical ranking per matchday (see how rankings evolved) | Could |

---

## 4. League Lifecycle & Randomization

The core mechanic of "Random League": teams are reset and randomized every matchday.

| ID | Requirement | Priority |
|----|-------------|----------|
| LIFE-01 | **Random Squad Generation**: At the start of each round/matchday, the admin triggers a **random assignment** of new players to all users | Must |
| LIFE-02 | Admin configures **randomization parameters**: number of players (e.g., 15) and **team valuation limit** (e.g., max €100M total value) | Must |
| LIFE-03 | **Global Lock**: Squads are **automatically locked** when the *first match* of the current La Liga Jornada begins | Must |
| LIFE-04 | If a real La Liga match is played early/advanced, the lock applies to that earlier time | Must |
| LIFE-05 | **Delayed Points**: If a real match is postponed, points are awarded retroactively when the match is played | Must |
| LIFE-06 | **Season Winner**: The user with the highest accumulated points at the end of the season wins | Must |
| LIFE-07 | Admin can manually **reset the league** or start a new "season" at any time | Must |

---

## 5. Player Pool & Team Generation

Since teams are randomized every round, the system acts as a "smart randomizer" based on admin constraints.

| ID | Requirement | Priority |
|----|-------------|----------|
| POOL-01 | **Valuation Source**: Player market values are fetched from **Transfermarkt** via Python scrapers | Must |
| POOL-02 | **No Duplicates**: A real-world player can only belong to **one user** in the entire league (exclusive ownership) | Must |
| POOL-03 | **Position Constraints**: Admin defines the **number of players per position** for the randomizer (e.g., 2 GK, 5 DEF, 5 MID, 3 FWD = 15 total) | Must |
| POOL-04 | **Valuation Cap**: The total market value of a user's generated squad must not exceed the admin-defined limit (e.g., €200M) | Should |
| POOL-05 | **Randomizer Logic**: System iteratively assigns players to users, respecting position slots and preventing duplicates, until all squads are full | Must |
| POOL-06 | **Fairness**: The randomizer should attempt to balance the total team value across users (e.g., ±10% difference) | Could |

---

## 6. Admin Features

The admin is **not a separate panel or dashboard** — it is a regular user account with an **admin role**. The admin accesses additional features from within the same app. There is a **single admin user** (the league organizer).

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-01 | One designated user has the **admin role** within the app (in-app, not a separate panel) | Must |
| ADM-02 | Admin sees **additional controls/sections** not visible to regular users | Must |
| ADM-03 | Admin can register/deactivate users | Must |
| ADM-04 | Admin can lock/unlock squad editing globally | Must |
| ADM-05 | Admin can publish posts on the forum | Must |
| ADM-06 | Admin can update player scores / match results | Must |
| ADM-07 | Admin can manage the player pool (add/remove/edit players) | Must |
| ADM-08 | Admin can assign players to users | Must |
| ADM-09 | Admin can moderate forum content (delete posts/comments) | Should |

---

## 7. Scoring System

Fantasy points are calculated automatically based on real La Liga player performance data fetched via custom Python scrapers. The server processes raw stats and converts them into fantasy points.

| ID | Requirement | Priority |
|----|-------------|----------|
| SCORE-01 | Points are calculated **automatically** from real La Liga match data via Python scrapers | Must |
| SCORE-02 | The **server/backend** runs the scrapers and processes stats — the app only reads from the database | Must |
| SCORE-03 | Points are awarded per player based on real-world performance (goals, assists, clean sheets, cards, minutes played, etc.) OR a scraped rating | Must |
| SCORE-04 | A **points table** dictates the scoring (if using raw stats) OR the scraped rating is used directly | Must |
| SCORE-05 | Only the **11 selected players** in a user's squad earn points (bench players do not score) | Must |
| SCORE-06 | Users can designate one player as **captain** — the captain earns **double points** | Must |
| SCORE-07 | Points are updated after each La Liga matchday | Must |
| SCORE-08 | Admin can **manually override** a player's points for a matchday if needed | Should |
| SCORE-09 | Historical points per player per matchday are stored for breakdown views | Should |

---

## 8. External Data Sources

The system uses open-source Python libraries to scrape real La Liga data (players, teams, match results, stats) to avoid API costs.

| ID | Requirement | Priority |
|----|-------------|----------|
| EXT-01 | Use **`soccerdata`** (FBref) OR **`sofascore_scraper`** as the **primary data source** | Must |
| EXT-02 | Fetch **player rosters** for all La Liga teams (name, position, team, photo if available) | Must |
| EXT-03 | Fetch **match fixtures and results** per matchday (jornada) | Must |
| EXT-04 | Fetch **individual player statistics** per match (goals, assists, minutes, cards, etc.) | Must |
| EXT-05 | Fetch **team logos and player photos** if scrapers allow, or fallback to placeholders/manual upload | Should |
| EXT-06 | Scrapers run on the **server as a scheduled job** (e.g., after each matchday) | Must |
| EXT-07 | The system must implement **caching and rate-limiting** to respect source website policies | Must |
| EXT-08 | Handle scraper failures gracefully (retry logic, admin alert if extraction fails) | Must |

| EXT-08 | Handle scraper failures gracefully (retry logic, admin alert if extraction fails) | Must |

---

## 9. Notifications

Push notifications keep users engaged and informed about critical league events.

| ID | Requirement | Priority |
|----|-------------|----------|
| NOTIF-01 | **New Team Available**: Notify users when the admin has randomized squads for a new round | Must |
| NOTIF-02 | **Squad Lock Warning**: Reminder notification 1 hour before the global squad lock | Must |
| NOTIF-03 | **Results Published**: Notify users when matchday points are calculated and rankings updated | Must |
| NOTIF-04 | **Forum Activity**: Notify users when someone replies to their post or mentions them | Should |
| NOTIF-05 | **Admin Announcements**: The admin can send a custom manual notification to all users | Should |
| NOTIF-06 | Users can toggle specific notification types on/off in settings | Could |

### 9.1 Weekly Chronicle Bot

A humorous AI bot that generates a weekly summary of the league.

| ID | Requirement | Priority |
|----|-------------|----------|
| BOT-01 | **Weekly Summary**: The bot generates a "Front Page" (Portada) post every Monday morning | Should |
| BOT-02 | **Content Sources**: The bot reads forum activity (top posts, banter), recent match results, and ranking changes | Should |
| BOT-03 | **Tone**: The summary is written in a **humorous, tabloid-style tone** (like a sports newspaper) | Should |
| BOT-04 | **Format**: The post mimics a newspaper front page (headline, key stories, "player of the week") | Should |
| BOT-05 | **Interaction**: Users can comment on and react to the bot's weekly post | Should |
| BOT-06 | **Implementation**: Uses an LLM (e.g., GPT-4o-mini / Gemini Flash) to generate text from structured league data | Should |

---

## 10. Data & Backend

| ID | Requirement | Priority |
|----|-------------|----------|
| DATA-01 | Database is hosted **externally** (not on-device) | Must |
| DATA-02 | App communicates with a backend API for all data operations | Must |
| DATA-03 | Data to store: users, squads, player pool, forum posts, reactions, rankings, league state, matchday scores | Must |
| DATA-04 | Real-time or near-real-time updates for the forum | Should |
| DATA-05 | Secure API communication (HTTPS) | Should |

---

## 11. Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NF-01 | App runs on both **iOS and Android** | Must |
| NF-02 | Responsive and smooth UI | Should |
| NF-03 | Offline support is **not required** (always-online app) | Info |
| NF-04 | No app store publication required (distributed via TestFlight / APK sideload or similar) | Info |
| NF-05 | Small user base (< 50 users expected) | Info |
| NF-06 | Minimal loading times for all views | Should |

---

## Priority Legend

| Label | Meaning |
|-------|---------|
| **Must** | Essential — the app doesn't work without it |
| **Should** | Important — strongly expected but not a blocker |
| **Could** | Nice to have — adds polish, can be deferred |
| **Info** | Context / constraint — not a functional requirement |
