# 🌐 API Layer (Block B)

**Responsibility**: The Gateway and Orchestrator. 

This layer defines the communication protocol between the Client App and the Cloud Infrastructure. It handles security, validation, and complex business logic.

## 📖 API Contracts (Conceptual)

The API is organized into functional resource groups:

1.  **[Auth & Identity](./contract/01_auth_identity.md)**: Login, Profile, and Sessions.
2.  **[League & Gameplay](./contract/02_league_gameplay.md)**: Squads, Player Pool, and Formation selection.
3.  **[Social & Forum](./contract/03_social_forum.md)**: Feed, Posting, Reactions, and Comments.
4.  **[Rankings & Classification](./contract/04_rankings_classification.md)**: Leaderboards and Performance stats.
5.  **[Admin Management](./contract/05_admin_management.md)**: League resets, manual lock, and score overrides.

---
> **Note**: These contracts remain implementation-agnostic (REST/GraphQL/RPC).