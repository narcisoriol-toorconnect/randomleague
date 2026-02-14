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
| `min_budget` | `Decimal` | Minimum total cost for the 15-player squad. |
| `max_budget` | `Decimal` | Maximum total cost for the 15-player squad. |
| `tier_config` | `JSON` | Price limits/categories for `STAR`, `GOOD`, `AVG`, `BAD`. |
| `pos_counts` | `JSON` | Required slots per position (e.g., `GK: 2...`). |
| `tier_targets` | `JSON` | **Target** slots per tier (e.g., `STAR: 1, GOOD: 3...`). |

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

### 3.4 Availability
- **Strict Exclusion**: Players with an `availability_status` other than `AVAILABLE` (e.g., `INJURED`, `SUSPENDED`) must be excluded from the `available_pool` before or during the draft phase.

### 3.5 Club Quota
- **Pure Luck**: There is no limit on how many players can come from the same real-life team.

---

## 4. Execution Algorithm

The engine follows a hierarchical "Fill-Down" strategy.

### 4.1 Step 1: The Star Selection (Strict & Persistent)
1. Pick exactly **1 STAR** from the `available_pool`.
2. **Criteria**:
   - Must match `MID` or `FWD` position.
   - Total squad cost (currently just this 1 player) must be $\leq$ `max_budget`.
3. **Draft Failure**: If no player in the `STAR` pool satisfies both position and budget, the engine must return a **Terminal Error** (League configuration is impossible).
4. **Persistence**: This selection is **stored**. If the subsequent steps fail and trigger a reset, this Star is **retained**.

### 4.2 Step 2: Hierarchical Tier Looping (GOOD -> AVG)
Iterate through tiers to fill remaining slots (2-15).

1. **Selection Logic**: For each requested slot in these tiers:
   - Pick a random player from the tier pool.
   - **Check**: Does the player fit an open position AND is `New_Total_Cost` $\leq$ `max_budget`?
2. **"Soft" Fallback**: If a selection violates either position or budget:
   - **DO NOT RETRY** this tier.
   - **Immediately move to the next tier** (e.g., skip from GOOD to AVG).
3. **AVG Tier Specifics**:
   - **GK Priority**: If no Goalkeepers have been selected yet, the engine MUST prioritize a `GK` selection in this tier if available.

### 4.3 Step 3: The Bad Tier (Fill & Guaranteed)
1. **Selection**: Fills all remaining empty slots up to 15.
2. **Budget Rule**: `max_budget` is **NOT** checked for players in this tier. They are selected purely based on position availability to ensure a complete squad.

### 4.4 Step 4: Final Validation & Reset
Once the 15 players are selected:
1. **Minimum Check**: `Total_Value` must be $\geq$ `min_budget`.
2. **Position Check**: All slots (2 GK, 5 DEF, 5 MID, 3 FWD) must be filled.
3. **Reset Trigger**: If `Total_Value < min_budget` or if the engine somehow failed to fill all 15 position slots:
   - **KEEP** the Star selected in Step 4.1.
   - **WIPE** all other 14 selections.
   - **RETRY** from Step 4.2.

---

## 5. Orchestrator Logic (External)
The **Core API** or **Worker** calling this engine is responsible for:
1.  Fetching all participating Users.
2.  Shuffling the User order.
3.  Looping through Users:
    - Call the Randomizer with the current state of the global player pool.
    - Subtract the returned 15 IDs from the global pool for the next user.
    - Persist the resulting squad.
