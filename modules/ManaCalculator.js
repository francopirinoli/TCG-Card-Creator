import { 
    GLOBAL_BALANCE, 
    TYPE_MODIFIERS, 
    STAT_COSTS, 
    KEYWORD_COSTS, 
    TRIGGER_MULTIPLIERS, 
    TARGET_MULTIPLIERS, 
    CONDITION_MULTIPLIERS, 
    EFFECT_COSTS, 
    RARITY_DISCOUNTS 
} from './CostRegistry.js';

/**
 * MANA CALCULATOR
 * The Logic Engine that converts Card Data into a Mana Cost.
 */
export class ManaCalculator {

    /**
     * Main entry point.
     * @param {Object} card - The current state of the card from the UI.
     * @returns {Object} balanceReport - Contains manaCost, totalVP, and breakdown.
     */
    static calculate(card) {
        // 1. Initialize Report
        let report = {
            manaCost: 0,
            totalVP: 0,
            breakdown: {
                base: GLOBAL_BALANCE.BASE_CARD_VP,
                stats: 0,
                keywords: 0,
                abilities: 0,
                rarityDiscount: 0,
                typeMod: 0
            },
            warnings: []
        };

        let runningVP = GLOBAL_BALANCE.BASE_CARD_VP;

        // 2. Calculate Stats VP
        // Spells usually have 0 stats, so this adds 0.
        // Weapons use 'health' input as 'durability'.
        const attackVP = (card.stats.attack || 0) * STAT_COSTS.ATTACK;
        const healthVP = (card.stats.health || 0) * STAT_COSTS.HEALTH;
        
        report.breakdown.stats = attackVP + healthVP;
        runningVP += report.breakdown.stats;

        // 3. Calculate Keywords VP
        // Iterate over the keys in card.keywords (e.g., { taunt: true, windfury: false })
        if (card.keywords) {
            Object.entries(card.keywords).forEach(([key, value]) => {
                if (value === true && KEYWORD_COSTS[key]) {
                    // Boolean keywords (Taunt)
                    report.breakdown.keywords += KEYWORD_COSTS[key];
                } else if (typeof value === 'number' && value > 0 && KEYWORD_COSTS[key]) {
                    // Numeric keywords (Spell Damage +1)
                    // Cost is usually per point (defined in logic, or simple multiplication)
                    report.breakdown.keywords += (KEYWORD_COSTS[key] * value);
                }
            });
        }
        runningVP += report.breakdown.keywords;

        // 4. Calculate Abilities VP
        if (card.abilities && Array.isArray(card.abilities)) {
            card.abilities.forEach(ability => {
                const abilityCost = this.calculateAbilityVP(ability, card);
                report.breakdown.abilities += abilityCost;
            });
        }
        runningVP += report.breakdown.abilities;

        // 5. Apply Rarity Discount (Subtraction)
        // Legendaries get "free stats" to make them feel powerful.
        const rarityDiscount = RARITY_DISCOUNTS[card.rarity] || 0;
        report.breakdown.rarityDiscount = rarityDiscount;
        runningVP -= rarityDiscount;

        // Ensure we don't go negative from discounts
        if (runningVP < 0) runningVP = 0;

        // 6. Apply Card Type Modifier (Multiplication)
        // Spells are cheaper (0.8x), Weapons are taxed (1.2x)
        const typeMod = TYPE_MODIFIERS[card.type] || 1.0;
        
        // We apply the modifier to the CURRENT total
        const vpBeforeMod = runningVP;
        runningVP = runningVP * typeMod;
        report.breakdown.typeMod = runningVP - vpBeforeMod; // Store the difference for the report

        // 7. Final Conversion to Mana
        report.totalVP = runningVP;
        
        // Formula: Floor( VP / 2.0 )
        let calculatedMana = Math.floor(runningVP / GLOBAL_BALANCE.VP_PER_MANA);

        // 8. Clamping & Safety
        if (calculatedMana < GLOBAL_BALANCE.MIN_MANA) calculatedMana = GLOBAL_BALANCE.MIN_MANA;
        
        if (calculatedMana > GLOBAL_BALANCE.MAX_MANA) {
            calculatedMana = GLOBAL_BALANCE.MAX_MANA;
            report.warnings.push(`Cost capped at ${GLOBAL_BALANCE.MAX_MANA}. Real cost: ${Math.floor(runningVP / 2)}`);
        }

        report.manaCost = calculatedMana;

        return report;
    }

    /**
     * Helper to calculate the cost of a single ability line.
     * Formula: (BaseEffect + (UnitCost * Value)) * Trigger * Target * Condition
     */
    static calculateAbilityVP(ability, cardContext) {
        const effectDef = EFFECT_COSTS[ability.effect];
        if (!effectDef) return 0;

        // A. Calculate Raw Effect Value
        let rawEffectVP = effectDef.base;

        // Handle specific logic based on effect type
        if (ability.effect === 'give_keyword' && ability.keyword) {
            // E.g. Give Divine Shield
            rawEffectVP += (KEYWORD_COSTS[ability.keyword] || 0);
        } 
        else if (ability.effect === 'summon_token') {
            // Sum of token stats * unit cost
            // We expect ability.value to hold "Attack" and ability.secondaryValue to hold "Health" for tokens
            // Or simplified: ability.value = sum of stats
            const tokenStats = (ability.value || 0); 
            rawEffectVP += (tokenStats * effectDef.unit);
        }
        else if (ability.effect === 'summon_copy') {
            // Recursive cost: Summoning a copy is worth the stats of the current card
            const currentStatsVP = (cardContext.stats.attack * STAT_COSTS.ATTACK) + 
                                   (cardContext.stats.health * STAT_COSTS.HEALTH);
            rawEffectVP += currentStatsVP;
        }
        else {
            // Standard numeric effects (Damage, Heal, Draw)
            // Value defaults to 0 if undefined
            rawEffectVP += (effectDef.unit * (ability.value || 0));
        }

        // B. Apply Multipliers
        const triggerMult = TRIGGER_MULTIPLIERS[ability.trigger] || 1.0;
        const targetMult = TARGET_MULTIPLIERS[ability.target] || 1.0;
        const conditionMult = CONDITION_MULTIPLIERS[ability.condition] || 1.0;

        // Final calculation for this specific ability
        return rawEffectVP * triggerMult * targetMult * conditionMult;
    }
}