# 🗄️ Database Layer (Block C)

**Responsibility**: The Source of Truth.

This layer defines the data models and storage logic for the system.

## 📖 Abstract Schemas

The data model is defined in an engine-agnostic relational format:

1.  **[Users & League Configuration](./schema/01_users_league.md)**: Identity and Global State.
2.  **[Game Entities](./schema/02_game_entities.md)**: Players, Squads, Matches, and Statistics.
3.  **[Social Interaction](./schema/03_social_interaction.md)**: Forum Posts and Reactions.
4.  **[Rankings & Notifications](./schema/04_rankings_notifications.md)**: Historical charts and Inbox.
5.  **[Audit & System Logs](./schema/05_audit_system_logs.md)**: Administrative accountability.

---
> **Note**: These schemas guide the physical database implementation (PostgreSQL/Supabase).