/**
 * ABILITIES DATABASE
 * Defines the "Grammar" for card effects.
 */

// --- 1. TRIGGERS ---
export const TRIGGERS = [
    { 
        id: "on_play", 
        name: { en: "Battlecry", es: "Grito de Batalla" }, 
        description: { en: "Triggered when you play this card from your hand.", es: "Se activa al jugar esta carta desde la mano." },
        costMultiplier: 1.0 
    },
    { 
        id: "on_death", 
        name: { en: "Deathrattle", es: "Último Aliento" }, 
        description: { en: "Triggered when this minion dies.", es: "Se activa cuando este esbirro muere." },
        costMultiplier: 0.8 
    },
    { 
        id: "on_end_turn", 
        name: { en: "End of Turn", es: "Al final del turno" }, 
        description: { en: "Triggered at the end of your turn.", es: "Se activa al final de tu turno." },
        costMultiplier: 1.2 
    },
    { 
        id: "on_start_turn", 
        name: { en: "Start of Turn", es: "Al inicio del turno" }, 
        description: { en: "Triggered at the start of your turn.", es: "Se activa al inicio de tu turno." },
        costMultiplier: 1.3 
    },
    { 
        id: "on_damage_taken", 
        name: { en: "Enrage / On Damage", es: "Enfurecer / Al recibir daño" }, 
        description: { en: "Triggered whenever this minion takes damage.", es: "Se activa cada vez que este esbirro recibe daño." },
        costMultiplier: 1.1 
    },
    { 
        id: "on_attack", 
        name: { en: "On Attack", es: "Al Atacar" }, 
        description: { en: "Triggered when this minion attacks.", es: "Se activa cuando este esbirro ataca." },
        costMultiplier: 1.1 
    },
    { 
        id: "on_spell_cast", 
        name: { en: "Spellburst", es: "Al lanzar hechizo" }, 
        description: { en: "Triggered whenever you cast a spell.", es: "Se activa cada vez que lanzas un hechizo." },
        costMultiplier: 1.2 
    },
    { 
        id: "combo", 
        name: { en: "Combo", es: "Combo" }, 
        description: { en: "Triggered if you played another card this turn.", es: "Se activa si jugaste otra carta este turno." },
        costMultiplier: 0.9 
    },
    { 
        id: "passive", 
        name: { en: "Passive Aura", es: "Aura Pasiva" }, 
        description: { en: "Always active.", es: "Siempre activo." },
        costMultiplier: 1.0 
    }
];

// --- 2. TARGETS ---
export const TARGETS = [
    { id: "none", name: { en: "None / Auto", es: "Ninguno / Auto" }, costMultiplier: 1.0 },
    { id: "target_any", name: { en: "Target Any", es: "Cualquier Objetivo" }, costMultiplier: 1.2, requiresSelection: true },
    { id: "target_enemy_minion", name: { en: "Target Enemy Minion", es: "Esbirro Enemigo (Obj)" }, costMultiplier: 1.1, requiresSelection: true },
    { id: "random_enemy_minion", name: { en: "Random Enemy Minion", es: "Esbirro Enemigo Aleatorio" }, costMultiplier: 1.0 },
    { id: "all_enemies", name: { en: "All Enemies", es: "Todos los Enemigos" }, costMultiplier: 2.5 },
    { id: "all_other_minions", name: { en: "All Other Minions", es: "Todos los demás esbirros" }, costMultiplier: 2.5 },
    { id: "friendly_hero", name: { en: "Your Hero", es: "Tu Héroe" }, costMultiplier: 1.0 },
    { id: "enemy_hero", name: { en: "Enemy Hero", es: "Héroe Enemigo" }, costMultiplier: 1.1 },
    { id: "self", name: { en: "Self", es: "A sí mismo" }, costMultiplier: 1.0 },
    { id: "all_friendly", name: { en: "All Friendly Minions", es: "Todos tus esbirros" }, costMultiplier: 2.2 }
];

// --- 3. CONDITIONS ---
export const GENERIC_CONDITIONS = [
    { id: "none", name: { en: "No Condition", es: "Sin Condición" }, costMultiplier: 1.0 },
    { id: "if_hand_empty", name: { en: "If hand is empty", es: "Si la mano está vacía" }, costMultiplier: 0.7 },
    { id: "if_holding_spell", name: { en: "If holding a Spell", es: "Si tienes un hechizo" }, costMultiplier: 0.9 },
    { id: "if_opponent_full_health", name: { en: "If opponent full HP", es: "Si oponente vida llena" }, costMultiplier: 0.9 },
    { id: "if_highlander", name: { en: "If no duplicates", es: "Si no hay duplicados" }, costMultiplier: 0.6 }
];

// --- 4. EFFECTS ---
export const EFFECTS = [
    // --- DAMAGE & HEALING ---
    { 
        id: "deal_damage", 
        name: { en: "Deal Damage", es: "Infligir Daño" }, 
        baseCost: 1.0, unitCost: 2.0, 
        requiresValue: true, label: "Amount"
    },
    { 
        id: "restore_health", 
        name: { en: "Restore Health", es: "Restaurar Salud" }, 
        baseCost: 0.5, unitCost: 1.0, 
        requiresValue: true, label: "Amount"
    },
    { 
        id: "gain_armor", 
        name: { en: "Gain Armor", es: "Ganar Armadura" }, 
        baseCost: 0.5, unitCost: 1.0, 
        requiresValue: true, label: "Amount"
    },
    
    // --- BOARD STATE ---
    { 
        id: "destroy_minion", 
        name: { en: "Destroy Minion", es: "Destruir Esbirro" }, 
        baseCost: 9.0, unitCost: 0
    },
    { 
        id: "silence", 
        name: { en: "Silence", es: "Silenciar" }, 
        baseCost: 2.5, unitCost: 0
    },
    { 
        id: "freeze", 
        name: { en: "Freeze", es: "Congelar" }, 
        baseCost: 2.0, unitCost: 0
    },
    { 
        id: "return_to_hand", 
        name: { en: "Return to Hand", es: "Devolver a mano" }, 
        baseCost: 4.0, unitCost: 0
    },
    { 
        id: "transform_sheep", 
        name: { en: "Polymorph (1/1)", es: "Polimorfia (1/1)" }, 
        baseCost: 6.0, unitCost: 0
    },

    // --- BUFFS & KEYWORDS ---
    { 
        id: "give_stats", 
        name: { en: "Give +X/+X", es: "Dar +X/+X" }, 
        baseCost: 0, unitCost: 2.0, 
        requiresStats: true
    },
    { 
        id: "give_keyword", 
        name: { en: "Give Keyword", es: "Dar Palabra Clave" }, 
        baseCost: 0, 
        requiresKeywordSelect: true
    },

    // --- ECONOMY & TRIBE ---
    { 
        id: "draw_card", 
        name: { en: "Draw Card(s)", es: "Robar Carta(s)" }, 
        baseCost: 2.0, unitCost: 3.5, 
        requiresValue: true, label: "Count"
    },
    { 
        id: "add_random_class", 
        name: { en: "Add Random Class Card", es: "Añadir carta clase" }, 
        baseCost: 1.0, unitCost: 2.0, 
        requiresValue: true, label: "Count"
    },
    { 
        id: "discover_tribe", 
        name: { en: "Discover a [Tribe]", es: "Descubre un [Tribu]" }, 
        baseCost: 2.0, unitCost: 0,
        requiresTribeSelect: true
    },
    { 
        id: "gain_mana", 
        name: { en: "Gain Mana Crystal", es: "Cristal de Maná" }, 
        baseCost: 4.0, unitCost: 0
    },
    { 
        id: "reduce_cost", 
        name: { en: "Reduce Hand Cost (1)", es: "Reducir coste mano" }, 
        baseCost: 10.0, unitCost: 0
    },

    // --- SUMMONING ---
    { 
        id: "summon_token", 
        name: { en: "Summon Token", es: "Invocar Ficha" }, 
        baseCost: 1.0, unitCost: 2.0, 
        requiresStats: true, 
        requiresTokenName: true
    },
    { 
        id: "summon_copy", 
        name: { en: "Summon Copy", es: "Invocar Copia" }, 
        baseCost: 0, unitCost: 0
    },

    // --- WEAPONS ---
    { 
        id: "equip_weapon", 
        name: { en: "Equip Weapon", es: "Equipar Arma" }, 
        baseCost: 1.0, unitCost: 1.5, 
        requiresStats: true
    }
];