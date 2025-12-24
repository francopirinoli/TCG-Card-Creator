/**
 * COST REGISTRY
 * Defines the "Value Point" (VP) economy.
 * 
 * CORE FORMULA:
 * 1 Mana ~= 2 Value Points (VP).
 */

// --- 1. GLOBAL SETTINGS ---
export const GLOBAL_BALANCE = {
    VP_PER_MANA: 2.0,       // The conversion rate
    BASE_CARD_VP: 1.0,      // Cost for the card slot itself
    MIN_MANA: 0,
    MAX_MANA: 10
};

// --- 2. CARD TYPE MODIFIERS ---
// Multipliers applied to the final VP before mana calculation.
export const TYPE_MODIFIERS = {
    minion: 1.0,    // Standard
    spell: 0.8,     // Spells are cheaper because they leave no body.
                    // Example: Deal 3 Dmg (7 VP) * 0.8 = 5.6 VP = 2 Mana (Darkbomb).
    weapon: 1.2     // Weapons are taxed because they have "Charge" inherent.
                    // Example: 3/2 Weapon (5 VP) * 1.2 = 6 VP = 3 Mana (Eaglehorn Bow).
};

// --- 3. STAT COSTS ---
export const STAT_COSTS = {
    ATTACK: 1.0,    // 1 Attack = 1 VP
    HEALTH: 1.0     // 1 Health/Durability = 1 VP
};

// --- 4. KEYWORD COSTS ---
// Flat VP cost for boolean keywords.
export const KEYWORD_COSTS = {
    taunt: 1.0,
    divine_shield: 2.5,
    stealth: 1.5,
    windfury: 3.0,
    charge: 3.0,
    rush: 2.0,
    lifesteal: 2.0,
    poisonous: 4.0,
    reborn: 2.5,
    elusive: 1.5,
    freeze_touch: 2.0
};

// --- 5. TRIGGER MULTIPLIERS ---
// "When does this happen?"
export const TRIGGER_MULTIPLIERS = {
    on_play: 1.0,           // Battlecry
    on_death: 0.8,          // Deathrattle (Delayed value)
    on_end_turn: 1.2,       // Recurring value (Fast)
    on_start_turn: 1.3,     // Recurring value (Slow but snowbally)
    on_damage_taken: 1.1,   // Enrage
    on_attack: 1.1,         // Attack trigger
    on_spell_cast: 1.3,     // Gadgetzan style
    on_inspire: 0.9,        // Hero Power trigger
    combo: 0.9,             // Rogue Combo
    passive: 1.0            // Aura
};

// --- 6. TARGET MULTIPLIERS ---
// "Who does it hit?"
export const TARGET_MULTIPLIERS = {
    none: 1.0,
    target_any: 1.2,        // Flexible targeting tax
    target_enemy_minion: 1.1,
    random_enemy_minion: 1.0,
    all_enemies: 2.5,       // AoE Tax
    all_other_minions: 2.5,
    friendly_hero: 1.0,
    enemy_hero: 1.1,        // Face damage tax
    self: 1.0,
    all_friendly: 2.2       // Board buff tax
};

// --- 7. CONDITION MULTIPLIERS ---
// "Is there a restriction?"
export const CONDITION_MULTIPLIERS = {
    none: 1.0,
    holding_tribe: 0.8,     // "If holding a Dragon"
    controlling_tribe: 0.7, // "If controlling a Mech"
    friendly_tribe_died: 0.75,
    if_hand_empty: 0.7,
    if_holding_spell: 0.9,
    if_opponent_full_health: 0.9,
    if_highlander: 0.6      // "If deck has no duplicates"
};

// --- 8. EFFECT COSTS ---
// Mathematical cost of specific actions.
export const EFFECT_COSTS = {
    deal_damage: { base: 1.0, unit: 2.0 },      // 3 Dmg = 1 + 6 = 7 VP
    restore_health: { base: 0.5, unit: 1.0 },   // 3 Heal = 0.5 + 3 = 3.5 VP
    gain_armor: { base: 0.5, unit: 1.0 },
    draw_card: { base: 2.0, unit: 3.5 },        // 1 Card = 5.5 VP (~2.5 Mana)
    add_random_class: { base: 1.0, unit: 2.0 },
    gain_stats: { base: 0.0, unit: 2.0 },       // +1/+1 = 4 VP
    summon_token: { base: 1.0, unit: 2.0 },     // 2/2 Token = 1 + 4 = 5 VP
    summon_copy: { base: 0.0, unit: 0.0 },      // Special case: Calculated recursively
    destroy_minion: { base: 9.0, unit: 0.0 },   // Hard removal
    silence: { base: 2.5, unit: 0.0 },
    freeze: { base: 2.0, unit: 0.0 },
    return_to_hand: { base: 4.0, unit: 0.0 },   // Sap
    transform_sheep: { base: 6.0, unit: 0.0 },  // Polymorph
    give_keyword: { base: 0.0, unit: 0.0 },     // Special case: Look up keyword cost
    equip_weapon: { base: 1.0, unit: 1.5 },     // (Atk+Dur)*1.5
    gain_mana: { base: 4.0, unit: 0.0 },        // Wild Growth
    reduce_cost: { base: 10.0, unit: 0.0 }      // Thaurissan
};

// --- 9. RARITY DISCOUNTS ---
// Subtracted from Total VP.
export const RARITY_DISCOUNTS = {
    common: 0.0,
    rare: 1.0,      // -0.5 Mana
    epic: 2.0,      // -1 Mana
    legendary: 3.0  // -1.5 Mana
};