# Abstract Schema: Audit & System Logs

This document defines the schema for tracking administrative and critical system actions.

## 1. Entities

### `audit_logs`
**Purpose**: Keeps a record of when an admin or system process changes critical data.
- `id` (Primary Key).
- `user_id` (Foreign Key -> `users.id`, Optional): Who performed the action. NULL if it was an automated system bot.
- `action` (String): Descriptive tag (e.g., `LEAGUE_RESET`, `USER_POINT_ADJUST`, `SQUAD_TRANSFER`, `POST_DELETE`, `USER_DEACTIVATE`).
- `target_type` (String): The table/entity affected (e.g., `players`, `forum_posts`).
- `target_id` (String): ID of the affected record.
- `old_values` (JSON, Optional): State before the change.
- `new_values` (JSON, Optional): State after the change.
- `created_at` (Timestamp).

## 2. Business Rules
- **Immutability**: Audit logs should be "insert-only". No user (even admin) should be able to edit or delete these logs.
- **Traceability**: Every manual change to scores or league state MUST generate an audit log entry.

## 3. Relationships
- Links to `users` to track *who* did *what*.
