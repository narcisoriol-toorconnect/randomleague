# Abstract Schema: Social Interation (Forum)

This document defines the schema for the community features of the league: Posts, Comments, and Reactions.

## 1. Entities

### `forum_posts`
**Purpose**: Stores all user-generated content and system announcements.
- `id` (Primary Key): Unique post ID (UUID).
- `parent_id` (UUID, Optional): FK to `forum_posts.id` to support threaded comments/replies.
- `user_id` (Foreign Key -> `users.id`): Author of the post.
- `created_at` (Timestamp): When it was published.
- `content` (Text): The body of the post (supports Markdown).
- `image_url` (String, Optional): Attached media.
- `type` (Enum):
    - `USER`: Regular post by a human.
    - `BOT`: Automated post (e.g. Chronicle Bot).
    - `SYSTEM`: Admin announcement.
- `is_deleted` (Boolean): Soft delete flag (for moderation).

### `reactions`
**Purpose**: Tracks user engagement on posts.
- `id` (Primary Key).
- `user_id` (Foreign Key -> `users.id`): Who reacted.
- `post_id` (Foreign Key -> `forum_posts.id`): Target content.
- `emoji` (String): The emotion (e.g., "🔥", "😂", "👍").
- `created_at` (Timestamp).

## 2. Relationships
- A `forum_post` belongs to one `user`.
- A `reaction` links a `user` to a `forum_post`.
- `forum_posts` can be referenced by the `chronicle` bot to generate weekly summaries (reading `content` and `reactions`).

## 3. Constraints
- **One Reaction Per Type**: Ideally, a user can react with multiple *different* emojis, but not spam the same one.
- **Content Policy**: Text content must not be empty if no image is attached.
