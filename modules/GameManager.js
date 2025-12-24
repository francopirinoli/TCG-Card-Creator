import { MIDGARD_PRESET, DEFAULT_PRESET } from '../data/presets.js';

/**
 * GAME MANAGER
 * Handles the state of the GAME DEFINITION (Tribes, Rules, Rarities).
 * This is distinct from the Card State.
 */
class GameManager {
    constructor() {
        // Initialize with Midgard as default, or load from LocalStorage if available
        this.config = this.loadFromStorage() || JSON.parse(JSON.stringify(MIDGARD_PRESET));
    }

    // --- Persistence ---
    loadFromStorage() {
        const saved = localStorage.getItem('card_forge_config');
        return saved ? JSON.parse(saved) : null;
    }

    saveToStorage() {
        localStorage.setItem('card_forge_config', JSON.stringify(this.config));
        console.log("Game Configuration Saved.");
    }

    resetToPreset(presetName = 'midgard') {
        if (presetName === 'midgard') {
            this.config = JSON.parse(JSON.stringify(MIDGARD_PRESET));
        } else {
            this.config = JSON.parse(JSON.stringify(DEFAULT_PRESET));
        }
        this.saveToStorage();
    }

    // --- Getters ---
    getTribes() {
        return this.config.tribes;
    }

    getRarities() {
        return this.config.rarities;
    }

    getRules() {
        return this.config.rules;
    }

    // --- Tribe Management (For Phase 5: Editing settings) ---
    
    addTribe(name, color) {
        const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const newTribe = { id, name, color };
        this.config.tribes.push(newTribe);
        this.saveToStorage();
        return newTribe;
    }

    updateTribe(id, newData) {
        const index = this.config.tribes.findIndex(t => t.id === id);
        if (index !== -1) {
            this.config.tribes[index] = { ...this.config.tribes[index], ...newData };
            this.saveToStorage();
        }
    }

    deleteTribe(id) {
        this.config.tribes = this.config.tribes.filter(t => t.id !== id);
        this.saveToStorage();
    }
}

// Export a singleton instance
export const gm = new GameManager();