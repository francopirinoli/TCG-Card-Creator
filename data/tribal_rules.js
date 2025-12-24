/**
 * TRIBAL MECHANICS REGISTRY
 */

export const TRIBAL_CONDITIONS = [
    {
        id: "holding_tribe",
        name: { en: "If holding a [Tribe]", es: "Si tienes un [Tribu] en mano" },
        costMultiplier: 0.8,
        requiresParam: true
    },
    {
        id: "controlling_tribe",
        name: { en: "If you control a [Tribe]", es: "Si controlas un [Tribu]" },
        costMultiplier: 0.7,
        requiresParam: true
    },
    {
        id: "friendly_tribe_died",
        name: { en: "If a [Tribe] died this turn", es: "Si un [Tribu] murió este turno" },
        costMultiplier: 0.75,
        requiresParam: true
    }
];

export const TRIBAL_TARGETS = [
    {
        id: "target_friendly_tribe",
        name: { en: "Friendly [Tribe]", es: "[Tribu] Aliado" },
        costMultiplier: 1.0, 
        requiresParam: true
    },
    {
        id: "target_enemy_tribe",
        name: { en: "Enemy [Tribe]", es: "[Tribu] Enemigo" },
        costMultiplier: 0.9,
        requiresParam: true
    },
    {
        id: "all_friendly_tribe",
        name: { en: "All Friendly [Tribe]s", es: "Todos los [Tribu] aliados" },
        costMultiplier: 1.8,
        requiresParam: true
    }
];

export const TRIBAL_EFFECTS = [
    {
        id: "discover_tribe",
        name: { en: "Discover a [Tribe]", es: "Descubre un [Tribu]" },
        baseCost: 2.0, 
        unitCost: 0,
        requiresParam: true
    },
    {
        id: "summon_tribe_random",
        name: { en: "Summon random [Tribe]", es: "Invoca [Tribu] aleatorio" },
        baseCost: 3.0,
        unitCost: 0,
        requiresParam: true
    }
];