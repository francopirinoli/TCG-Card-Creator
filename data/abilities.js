/**
 * ABILITIES DATABASE
 * 
 * Defines the "Grammar" for card effects.
 * Structure: [Trigger] + [Condition?] + [Target?] + [Effect]
 * 
 * VP (Value Point) Logic: 1 Mana ~= 2 VP.
 */

// --- 1. TRIGGERS (When does it happen?) ---
export const TRIGGERS = [
    { 
        id: "on_play", 
        name: { en: "Battlecry", es: "Grito de Batalla" }, 
        description: { en: "When you play this card.", es: "Al jugar esta carta." },
        costMultiplier: 1.0 
    },
    { 
        id: "on_death", 
        name: { en: "Deathrattle", es: "Último Aliento" }, 
        description: { en: "When this minion dies.", es: "Cuando este esbirro muere." },
        costMultiplier: 0.8 // Cheaper because it's delayed/silenceable
    },
    { 
        id: "on_end_turn", 
        name: { en: "End of Turn", es: "Al final del turno" }, 
        description: { en: "At the end of your turn.", es: "Al final de tu turno." },
        costMultiplier: 1.2 // Recurring value
    },
    { 
        id: "on_start_turn", 
        name: { en: "Start of Turn", es: "Al inicio del turno" }, 
        description: { en: "At the start of your turn.", es: "Al inicio de tu turno." },
        costMultiplier: 1.3 // High snowball potential
    },
    { 
        id: "on_damage_taken", 
        name: { en: "Enrage / On Damage", es: "Enfurecer / Al recibir daño" }, 
        description: { en: "Whenever this minion takes damage.", es: "Cada vez que este esbirro recibe daño." },
        costMultiplier: 1.1 
    },
    { 
        id: "on_attack", 
        name: { en: "On Attack", es: "Al Atacar" }, 
        description: { en: "Whenever this minion attacks.", es: "Cada vez que este esbirro ataca." },
        costMultiplier: 1.1 
    },
    { 
        id: "on_spell_cast", 
        name: { en: "Spellburst", es: "Al lanzar hechizo" }, 
        description: { en: "Whenever you cast a spell.", es: "Cada vez que lanzas un hechizo." },
        costMultiplier: 1.2 
    },
    { 
        id: "combo", 
        name: { en: "Combo", es: "Combo" }, 
        description: { en: "If you played another card first.", es: "Si jugaste otra carta antes." },
        costMultiplier: 0.9 // Mild discount for the requirement
    },
    { 
        id: "passive", 
        name: { en: "Passive Aura", es: "Aura Pasiva" }, 
        description: { en: "Always active.", es: "Siempre activo." },
        costMultiplier: 1.0 
    }
];

// --- 2. TARGETS (Who is affected?) ---
export const TARGETS = [
    { 
        id: "none", 
        name: { en: "None / Auto", es: "Ninguno / Auto" }, 
        costMultiplier: 1.0 
    },
    { 
        id: "target_any", 
        name: { en: "Target Any", es: "Cualquier Objetivo" }, 
        costMultiplier: 1.2, 
        requiresSelection: true // In-game requires clicking a target
    },
    { 
        id: "target_enemy_minion", 
        name: { en: "Target Enemy Minion", es: "Esbirro Enemigo (Obj)" }, 
        costMultiplier: 1.1,
        requiresSelection: true
    },
    { 
        id: "random_enemy_minion", 
        name: { en: "Random Enemy Minion", es: "Esbirro Enemigo Aleatorio" }, 
        costMultiplier: 1.0 
    },
    { 
        id: "all_enemies", 
        name: { en: "All Enemies", es: "Todos los Enemigos" }, 
        costMultiplier: 2.5 // AoE is expensive
    },
    { 
        id: "all_other_minions", 
        name: { en: "All Other Minions", es: "Todos los demás esbirros" }, 
        costMultiplier: 2.5 
    },
    { 
        id: "friendly_hero", 
        name: { en: "Your Hero", es: "Tu Héroe" }, 
        costMultiplier: 1.0 
    },
    { 
        id: "enemy_hero", 
        name: { en: "Enemy Hero", es: "Héroe Enemigo" }, 
        costMultiplier: 1.1 // Face damage tax
    },
    { 
        id: "self", 
        name: { en: "Self", es: "A sí mismo" }, 
        costMultiplier: 1.0 
    }
];

// --- 3. CONDITIONS (Generic Restrictions) ---
// Note: Tribal conditions are imported from tribal_rules.js
export const GENERIC_CONDITIONS = [
    {
        id: "none",
        name: { en: "None", es: "Ninguna" },
        costMultiplier: 1.0
    },
    {
        id: "if_hand_empty",
        name: { en: "If hand is empty", es: "Si la mano está vacía" },
        costMultiplier: 0.7
    },
    {
        id: "if_holding_spell",
        name: { en: "If holding a Spell", es: "Si tienes un hechizo" },
        costMultiplier: 0.9
    },
    {
        id: "if_opponent_full_health",
        name: { en: "If opponent has full HP", es: "Si el oponente tiene la vida llena" },
        costMultiplier: 0.9
    },
    {
        id: "if_highlander",
        name: { en: "If deck has no duplicates", es: "Si el mazo no tiene duplicados" },
        costMultiplier: 0.6 // Huge discount (Reno Jackson effect)
    }
];

// --- 4. EFFECTS (What happens?) ---
export const EFFECTS = [
    // --- DAMAGE & HEALING ---
    { 
        id: "deal_damage", 
        name: { en: "Deal Damage", es: "Infligir Daño" }, 
        baseCost: 1.0, 
        unitCost: 2.0, // 3 Dmg = 7 VP
        requiresValue: true,
        label: "Amount"
    },
    { 
        id: "restore_health", 
        name: { en: "Restore Health", es: "Restaurar Salud" }, 
        baseCost: 0.5, 
        unitCost: 1.0, 
        requiresValue: true,
        label: "Amount"
    },
    { 
        id: "gain_armor", 
        name: { en: "Gain Armor", es: "Ganar Armadura" }, 
        baseCost: 0.5, 
        unitCost: 1.0, 
        requiresValue: true,
        label: "Amount"
    },
    
    // --- BOARD STATE ---
    { 
        id: "destroy_minion", 
        name: { en: "Destroy Minion", es: "Destruir Esbirro" }, 
        baseCost: 9.0, // Hard removal
        unitCost: 0
    },
    { 
        id: "silence", 
        name: { en: "Silence", es: "Silenciar" }, 
        baseCost: 2.5, 
        unitCost: 0
    },
    { 
        id: "freeze", 
        name: { en: "Freeze", es: "Congelar" }, 
        baseCost: 2.0, 
        unitCost: 0
    },
    { 
        id: "return_to_hand", 
        name: { en: "Return to Hand (Sap)", es: "Devolver a la mano" }, 
        baseCost: 4.0, 
        unitCost: 0
    },
    { 
        id: "transform_sheep", 
        name: { en: "Polymorph (1/1)", es: "Polimorfia (1/1)" }, 
        baseCost: 6.0, 
        unitCost: 0,
        techNote: "Soft removal (Hex/Polymorph)"
    },

    // --- BUFFS ---
    { 
        id: "give_stats", 
        name: { en: "Give +X/+X", es: "Dar +X/+X" }, 
        baseCost: 0, 
        unitCost: 2.0, // Calculated on Sum of stats
        requiresStats: true, // UI should show two inputs: Attack/Health
        label: "Buff Stats" 
    },
    { 
        id: "give_keyword", 
        name: { en: "Give Keyword", es: "Dar Palabra Clave" }, 
        baseCost: 0, 
        requiresKeywordSelect: true // UI should show Keyword Dropdown
    },

    // --- ECONOMY ---
    { 
        id: "draw_card", 
        name: { en: "Draw Card(s)", es: "Robar Carta(s)" }, 
        baseCost: 2.0, 
        unitCost: 3.5, // Drawing is premium
        requiresValue: true,
        label: "Cards"
    },
    { 
        id: "add_random_class", 
        name: { en: "Add Random Class Card", es: "Añadir carta de clase aleatoria" }, 
        baseCost: 1.0, 
        unitCost: 2.0, // Cheaper than drawing from deck (Card Advantage but low quality)
        requiresValue: true,
        label: "Cards"
    },
    { 
        id: "gain_mana", 
        name: { en: "Gain Empty Mana Crystal", es: "Ganar Cristal de Maná vacío" }, 
        baseCost: 4.0, // Ramp is expensive
        unitCost: 0
    },
    { 
        id: "reduce_cost", 
        name: { en: "Reduce Cost of Hand by (1)", es: "Reducir coste de mano en (1)" }, 
        baseCost: 10.0, // Emperor Thaurissan effect
        unitCost: 0
    },

    // --- SUMMONING ---
    { 
        id: "summon_token", 
        name: { en: "Summon Token", es: "Invocar Ficha" }, 
        baseCost: 1.0, 
        unitCost: 2.0, // Sum of stats * 2
        requiresTokenDef: true, // UI needs Name, Atk, HP inputs
        label: "Token"
    },
    { 
        id: "summon_copy", 
        name: { en: "Summon Copy of Self", es: "Invocar Copia de sí mismo" }, 
        baseCost: 0, 
        unitCost: 0,
        techNote: "Dynamic cost: Uses the card's own stats VP calculation"
    },

    // --- WEAPONS ---
    { 
        id: "equip_weapon", 
        name: { en: "Equip Weapon", es: "Equipar Arma" }, 
        baseCost: 1.0, 
        unitCost: 1.5, // (Atk + Durability) * 1.5
        requiresStats: true,
        label: "Weapon (Atk/Dur)"
    }
];