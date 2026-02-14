# API Contract: Auth & Identity

This document defines the conceptual interface for user management and authentication.

## 1. Authentication

### `POST /auth/login`
**Purpose**: Entry point for all users.
- **Inputs**: `identifier` (email/username), `password`.
- **Outputs**: 
    - `Success`: `auth_token`, `user_object` (profile + role).
    - `Error`: `invalid_credentials`.

### `POST /auth/logout`
**Purpose**: Terminate session.
- **Inputs**: None.
- **Outputs**: `Success`.

## 2. User Profiles

### `GET /profile/me`
**Purpose**: Get current user's data and current rank.
- **Inputs**: None (uses Auth Token).
- **Outputs**: `user_profile` (ID, Username, Role, Avatar, Notification Config).

### `PATCH /profile/me`
**Purpose**: Update display name or notification toggles.
- **Inputs**: `display_name` (optional), `notification_preferences` (optional).
- **Outputs**: Updated `user_profile`.

### `GET /profile/{user_id}`
**Purpose**: View another participant's profile summary.
- **Inputs**: `user_id`.
- **Outputs**: `public_profile` (Username, Join Date, Current Points).
