/**
 * GAME CONFIGURATION PRESETS
 * Stores the rules, tribes, and structures for specific games.
 */

export const MIDGARD_PRESET = {
    meta: {
        id: "midgard_tcg",
        name: "Midgard TCG",
        version: "1.0"
    },
    rules: {
        deckSize: 40,
        maxCopiesPerCard: 3,
        // Rule: "Settings will allow for only using cards from up to 2 tribes"
        maxTribesPerDeck: 2, 
        
        // Metadata for the project tracker (Goal setting)
        projectStructure: {
            tribesCount: 6,
            distributionPerTribe: {
                minions: 32, // 8 minions * 4 rarities
                spells: 12,  // 3 spells * 4 rarities
                weapons: 4   // 1 weapon * 4 rarities
            }
        }
    },
    rarities: [
        { id: "common", name: "Common", color: "#a8a8a8", discount: 0 },
        { id: "rare", name: "Rare", color: "#0070dd", discount: 1.0 },
        { id: "epic", name: "Epic", color: "#a335ee", discount: 2.0 },
        { id: "legendary", name: "Legendary", color: "#ff8000", discount: 3.0 }
    ],
    // The 6 Generic Tribes for Midgard (Placeholders to be renamed by user)
    tribes: [
        { id: "tribe_1", name: "Aesir", color: "#d32f2f" }, // Red
        { id: "tribe_2", name: "Vanir", color: "#388e3c" }, // Green
        { id: "tribe_3", name: "Jotunn", color: "#1976d2" }, // Blue
        { id: "tribe_4", name: "Dwarves", color: "#fbc02d" }, // Gold
        { id: "tribe_5", name: "Elves", color: "#7b1fa2" }, // Purple
        { id: "tribe_6", name: "Monsters", color: "#455a64" }, // Grey/Dark
        { id: "neutral", name: "Neutral", color: "#757575" } // Standard Neutral
    ]
};

export const DEFAULT_PRESET = {
    meta: { id: "generic", name: "Generic Game" },
    rules: { maxTribesPerDeck: 99 },
    rarities: MIDGARD_PRESET.rarities,
    tribes: [
        { id: "general", name: "General", color: "#888888" }
    ]
};