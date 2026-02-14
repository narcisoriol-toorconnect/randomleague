# 🏆 Random League — La Liga Fantasy League App

A private fantasy league soccer app for La Liga, built for a group of colleagues. Not intended for public distribution.

**Platform:** iOS & Android
**Type:** Personal / Internal use

---

## Overview

Random League is a fantasy soccer app focused on La Liga. Users compete by selecting their best 11 players from a pool of 15, choosing a formation, and tracking their rankings against other participants. The app also features a social forum for banter, reactions, and community interaction.

Users are manually registered by the admin. One user (the league organizer) has an **admin role** and manages the league from within the same app.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Requirements](./docs/REQUIREMENTS.md) | Full list of functional and non-functional requirements |
| [Architecture](./docs/ARCHITECTURE.md) | High-level system design and use cases |

---

## Project Structure

The repository is organized by **Functional Domains** (Conceptual Blocks):

- **[`📱 client/`](./client/README.md)**: The User Interface (Mobile App).
- **[`🌐 api/`](./api/README.md)**: The Backend Logic & API Gateway.
- **[`🗄️ database/`](./database/README.md)**: Schema definitions and Migrations.
- **[`🎲 engine/`](./engine/README.md)**: Core Game Mechanics (Randomizer, Scorer).
- **[`🕷️ scrapers/`](./scrapers/README.md)**: External Data Connectors (Player/Match stats).
- **[`📰 chronicle/`](./chronicle/README.md)**: Content Generation Bots (AI Journalist).
- **[`📚 docs/`](./docs/README.md)**: Project Documentation.

---

> **Next steps:** Set up the backend structure and database schema.
