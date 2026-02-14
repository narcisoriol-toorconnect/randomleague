# 🎲 Randomizer Engine — Technical Specification

This document defines the logic and algorithmic behavior of the **Randomizer Engine**. 

## 1. Engine Archetype: The "Micro-Generator"
The Randomizer is a **pure function**. It is stateless and does not know about "Users" or "Leagues". It simply generates one valid squad of 15 players based on a provided pool.

---

## 2. Data Contract

### 2.1 Inputs
The engine is a pure function. Every time it runs, it expects:

| Name | Type | Description |
| :--- | :--- | :--- |
| `available_pool` | `List[Player]` | Array of `{ id, position, market_value, club_id }`. |
| `max_value` | `Decimal` | Total budget allowed for the 15 players. |
| `tier_config` | `JSON` | Price limits for `STAR`, `GOOD`, `AVG`, `BAD`. |
| `pos_counts` | `JSON` | Required slots per position (e.g., `GK: 2...`). |
| `tier_counts` | `JSON` | Required slots per tier (e.g., `STAR: 1...`). |

### 2.2 Outputs
The engine returns the result of the generation:

| Name | Type | Description |
| :--- | :--- | :--- |
| `squad_ids` | `List[ID]` | Array of 15 unique Player IDs that satisfy all constraints. |
| `total_cost` | `Decimal` | The sum of market values of the selected players. |

---

## 3. Core Constraints (The Rules)

### 3.1 Tier Selection
The engine must pick exactly:
- **1 STAR**
- **3 GOOD PLAYERS**
- **6 AVG PLAYERS**
- **5 BAD PLAYERS**

### 3.2 Position Slots
The 15 players must fill exactly:
- **2 Goalkeepers (GK)**
- **5 Defenders (DEF)**
- **5 Midfielders (MID)**
- **3 Forwards (FWD)**

### 3.3 The "Elite Striker" Rule
The **STAR** player categorized in the input must **ALWAYS** be a `MID` or `FWD`. 
- *Rationale*: Guarantees that every user has a high-scoring attacking threat.

### 3.4 Club Quota
- **Pure Luck**: There is no limit on how many players can come from the same real-life team.

---

## 4. Execution Algorithm

1.  **Preparation**: Split the `available_pool` into 4 sub-pools based on the `tier_config`.
2.  **Pass 1 (The Star)**: 
    - Randomly select 1 player from the `STAR` pool.
    - Validate that they are a `MID` or `FWD`.
    - If valid, decrement the `pos_counts` and `tier_counts`.
3.  **Pass 2 (The Good)**: 
    - Randomly select 3 players from the `GOOD` pool.
    - For each, ensure their position still has an open slot in `pos_counts`.
4.  **Pass 3 & 4 (Avg & Bad)**:
    - Sequentially fill the remaining 11 slots using the same slot-checking logic.
5.  **Final Validation (The Reset Trigger)**:
    - **Budget**: Calculate `Total_Value`. If `Total_Value > max_value`, **ABORT** and restart step 1.
    - **Deadlock**: If an open slot remains (e.g., GK) but no available players in the required tier match that position, **ABORT** and restart step 1.

---

## 5. Orchestrator Logic (External)
The **Core API** or **Worker** calling this engine is responsible for:
1.  Fetching all participating Users.
2.  Shuffling the User order.
3.  Looping through Users:
    - Call the Randomizer with the current state of the global player pool.
    - Subtract the returned 15 IDs from the global pool for the next user.
    - Persist the resulting squad.
