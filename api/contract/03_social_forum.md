# API Contract: Social & Forum

This document defines the interface for user interaction and social engagement.

## 1. Forum Interaction

### `GET /forum/feed`
**Purpose**: Fetch the chronological list of posts.
- **Inputs**: `offset` (for pagination, optional), `limit` (optional).
- **Outputs**: 
    - List of `post_objects`: (ID, Author_Profile, Content, Image_URL, Reaction_Counts, Comment_Count, Created_At).

### `POST /forum/posts`
**Purpose**: Create a new post or a system announcement.
- **Inputs**: `content` (Markdown string), `image_url` (optional).
- **Outputs**: Created `post_object`.

### `POST /forum/posts/{post_id}/comments`
**Purpose**: Reply to a specific post.
- **Inputs**: `post_id` (in URI), `content`.
- **Outputs**: Created `comment_object` (linked to `parent_id`).

## 2. Reactions

### `POST /forum/posts/{post_id}/react`
**Purpose**: Add or toggle an emoji reaction.
- **Inputs**: `post_id`, `emoji` (string).
- **Outputs**: Updated reaction counts for the post.

### `DELETE /forum/posts/{post_id}/react`
**Purpose**: Remove a previously added reaction.
- **Inputs**: `post_id`, `emoji`.
- **Outputs**: Updated reaction counts.
