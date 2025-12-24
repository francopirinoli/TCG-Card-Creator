/**
 * TRIBAL MECHANICS REGISTRY
 * These define how cards can interact with Tribes generically.
 * 
 * VP Cost Logic:
 * Synergies are cheaper than unconditional effects because they have a "failure rate".
 * - Holding a Tribe: Easy to achieve (0.8x cost)
 * - Controlling a Tribe: Harder, board dependent (0.7x cost)
 */

export const TRIBAL_CONDITIONS = [
    {
        id: "holding_tribe",
        name: { en: "If holding a [Tribe]", es: "Si tienes un [Tribu] en mano" },
        costMultiplier: 0.8, // 20% Discount on the ability
        requiresParam: true, // UI must show Tribe Dropdown
        techNote: "Checks hand for specific tag. e.g. Blackwing Corruptor"
    },
    {
        id: "controlling_tribe",
        name: { en: "If you control a [Tribe]", es: "Si controlas un [Tribu]" },
        costMultiplier: 0.7, // 30% Discount
        requiresParam: true,
        techNote: "Checks board for specific tag. e.g. Tinkertown Technician"
    },
    {
        id: "friendly_tribe_died",
        name: { en: "If a [Tribe] died this turn", es: "Si un [Tribu] murió este turno" },
        costMultiplier: 0.75,
        requiresParam: true,
        techNote: "Graveyard check. e.g. Dragon Breath"
    }
];

export const TRIBAL_TARGETS = [
    {
        id: "target_friendly_tribe",
        name: { en: "Friendly [Tribe]", es: "[Tribu] Aliado" },
        costMultiplier: 1.0, 
        requiresParam: true,
        techNote: "Limits target scope to specific tribe. e.g. Houndmaster (Beasts)"
    },
    {
        id: "target_enemy_tribe",
        name: { en: "Enemy [Tribe]", es: "[Tribu] Enemigo" },
        costMultiplier: 0.9, // Slightly cheaper as it might miss
        requiresParam: true,
        techNote: "Hate cards. e.g. Sacrificial Pact (Demons)"
    },
    {
        id: "all_friendly_tribe",
        name: { en: "All Friendly [Tribe]s", es: "Todos los [Tribu] aliados" },
        costMultiplier: 1.8, // Cheaper than "All Minions" (2.5)
        requiresParam: true,
        techNote: "Board wide tribal buff. e.g. Murloc Warleader effect"
    }
];

export const TRIBAL_EFFECTS = [
    {
        id: "discover_tribe",
        name: { en: "Discover a [Tribe]", es: "Descubre un [Tribu]" },
        baseCost: 2.0, 
        unitCost: 0,
        requiresParam: true,
        techNote: "Generates a card of specific tribe."
    },
    {
        id: "summon_tribe_random",
        name: { en: "Summon random [Tribe]", es: "Invoca [Tribu] aleatorio" },
        baseCost: 3.0, // High variance
        unitCost: 0,
        requiresParam: true,
        techNote: "e.g. Ram Wrangler"
    }
];