import { KEYWORDS } from '../data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from '../data/abilities.js';
import { TRIBAL_CONDITIONS, TRIBAL_TARGETS } from '../data/tribal_rules.js';
import { gm } from './GameManager.js';

export class AbilityBuilder {
    constructor() {
        this.ui = {};
        this.onSaveCallback = null;
    }

    /**
     * One-time setup to grab DOM elements and bind static listeners.
     */
    init() {
        // Map DOM elements
        this.ui = {
            modal: document.getElementById('abilityModal'),
            btnClose: document.getElementById('btnCloseAbility'),
            btnConfirm: document.getElementById('btnConfirmAbility'),
            
            // Inputs
            flavorName: document.getElementById('abModalName'),
            trigger: document.getElementById('abModalTrigger'),
            condition: document.getElementById('abModalCondition'),
            condTribe: document.getElementById('abModalCondTribe'),
            effect: document.getElementById('abModalEffect'),
            target: document.getElementById('abModalTarget'),
            
            // Dynamic Inputs Container
            effectInputs: document.getElementById('abEffectInputs'),
            valInput: document.getElementById('abModalValue'),
            kwSelect: document.getElementById('abModalKeyword'),
            effTribeSelect: document.getElementById('abModalEffectTribe'),
            
            // Token Params
            tokenBox: document.getElementById('abModalTokenParams'),
            tokenName: document.getElementById('abModalTokenName'),
            tokenAtk: document.getElementById('abModalTokenAtk'),
            tokenHp: document.getElementById('abModalTokenHp'),

            // Text Areas
            descTrigger: document.getElementById('descTrigger'),
            previewText: document.getElementById('abModalPreviewText')
        };

        this.bindEvents();
    }

    bindEvents() {
        // Close / Save
        this.ui.btnClose.addEventListener('click', () => this.close());
        this.ui.btnConfirm.addEventListener('click', () => this.save());

        // Change Listeners (Logic & Preview Updates)
        const inputs = [
            this.ui.flavorName, this.ui.trigger, this.ui.condition, 
            this.ui.condTribe, this.ui.effect, this.ui.target,
            this.ui.valInput, this.ui.kwSelect, this.ui.effTribeSelect,
            this.ui.tokenName, this.ui.tokenAtk, this.ui.tokenHp
        ];

        inputs.forEach(el => {
            el.addEventListener('input', () => this.updatePreview());
            el.addEventListener('change', () => this.updateLogic()); // Heavy logic on change
        });
    }

    /**
     * Opens the modal and prepares it for a new ability.
     * @param {Function} saveCallback - Function to call with the new Ability Object.
     */
    open(saveCallback) {
        this.onSaveCallback = saveCallback;
        this.populateDropdowns();
        this.resetForm();
        this.ui.modal.classList.remove('hidden');
        this.updateLogic(); // Set initial visibility
    }

    close() {
        this.ui.modal.classList.add('hidden');
        this.onSaveCallback = null;
    }

    populateDropdowns() {
        const createOpt = (val, text, dataset = {}) => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = text;
            Object.entries(dataset).forEach(([k, v]) => opt.dataset[k] = v);
            return opt;
        };

        // 1. Triggers
        this.ui.trigger.innerHTML = '';
        TRIGGERS.forEach(t => {
            this.ui.trigger.appendChild(createOpt(t.id, t.name.en, { desc: t.description.en }));
        });

        // 2. Conditions (Generic + Tribal)
        this.ui.condition.innerHTML = '';
        this.ui.condition.appendChild(createOpt('none', 'No Condition'));
        
        const grpGen = document.createElement('optgroup');
        grpGen.label = "Generic";
        GENERIC_CONDITIONS.forEach(c => grpGen.appendChild(createOpt(c.id, c.name.en)));
        this.ui.condition.appendChild(grpGen);

        const grpTribe = document.createElement('optgroup');
        grpTribe.label = "Tribal";
        TRIBAL_CONDITIONS.forEach(c => {
            // Check if tribal condition requires a param
            grpTribe.appendChild(createOpt(c.id, c.name.en, { reqTribe: c.requiresParam }));
        });
        this.ui.condition.appendChild(grpTribe);

        // 3. Effects
        this.ui.effect.innerHTML = '';
        EFFECTS.forEach(e => {
            this.ui.effect.appendChild(createOpt(e.id, e.name.en, {
                reqVal: e.requiresValue || false,
                reqStats: e.requiresStats || false,
                reqKeyword: e.requiresKeywordSelect || false,
                reqTribe: e.requiresTribeSelect || false,
                reqToken: e.requiresTokenName || false
            }));
        });

        // 4. Targets
        this.ui.target.innerHTML = '';
        TARGETS.forEach(t => this.ui.target.appendChild(createOpt(t.id, t.name.en)));

        // 5. Context Helpers (Tribes & Keywords)
        const tribes = gm.getTribes();
        
        // Helper to fill tribe selects
        const fillTribes = (el) => {
            el.innerHTML = '';
            tribes.forEach(t => el.appendChild(createOpt(t.id, t.name.en)));
        };
        fillTribes(this.ui.condTribe);
        fillTribes(this.ui.effTribeSelect);

        // Helper to fill keywords
        this.ui.kwSelect.innerHTML = '';
        KEYWORDS.forEach(k => this.ui.kwSelect.appendChild(createOpt(k.id, k.name.en)));
    }

    resetForm() {
        this.ui.flavorName.value = '';
        this.ui.trigger.selectedIndex = 0;
        this.ui.condition.value = 'none';
        this.ui.effect.selectedIndex = 0;
        this.ui.target.selectedIndex = 0;
        this.ui.valInput.value = 1;
        this.ui.tokenName.value = '';
        this.ui.tokenAtk.value = 1;
        this.ui.tokenHp.value = 1;
    }

    /**
     * Handles showing/hiding inputs based on current selections.
     */
    updateLogic() {
        // 1. Update Description Help Text
        const trigOpt = this.ui.trigger.options[this.ui.trigger.selectedIndex];
        this.ui.descTrigger.textContent = trigOpt.dataset.desc || "";

        // 2. Condition Logic
        const condOpt = this.ui.condition.options[this.ui.condition.selectedIndex];
        const condReqTribe = condOpt.dataset.reqTribe === "true";
        
        if (condReqTribe) this.ui.condTribe.classList.remove('input-hidden');
        else this.ui.condTribe.classList.add('input-hidden');

        // 3. Effect Logic
        const effOpt = this.ui.effect.options[this.ui.effect.selectedIndex];
        const d = effOpt.dataset;

        // Reset all visibility
        this.ui.valInput.classList.add('input-hidden');
        this.ui.kwSelect.classList.add('input-hidden');
        this.ui.effTribeSelect.classList.add('input-hidden');
        this.ui.tokenBox.classList.add('input-hidden');

        // Toggle specific inputs
        if (d.reqVal === "true") {
            this.ui.valInput.classList.remove('input-hidden');
            this.ui.valInput.placeholder = "Value";
        }
        // "Give +X/+X" logic
        if (d.reqStats === "true" && d.reqToken !== "true") {
            this.ui.valInput.classList.remove('input-hidden');
            this.ui.valInput.placeholder = "Stat Sum (+X/+X)";
        }
        if (d.reqKeyword === "true") {
            this.ui.kwSelect.classList.remove('input-hidden');
        }
        if (d.reqTribe === "true") {
            this.ui.effTribeSelect.classList.remove('input-hidden');
        }
        if (d.reqToken === "true") {
            this.ui.tokenBox.classList.remove('input-hidden');
        }

        this.updatePreview();
    }

    /**
     * Generates the readable text string for the modal preview.
     */
    updatePreview() {
        const data = this.scrapeData();
        let text = "";

        // 1. Trigger / Flavor
        if (data.flavorName) {
            text += `<b>${data.flavorName}</b> `;
            if (data.trigger !== 'passive') {
                const trigName = TRIGGERS.find(t => t.id === data.trigger)?.name.en;
                text += `(${trigName}): `;
            } else {
                text += `: `;
            }
        } else {
            const trigName = TRIGGERS.find(t => t.id === data.trigger)?.name.en;
            if (data.trigger !== 'passive') text += `<b>${trigName}:</b> `;
        }

        // 2. Condition
        if (data.condition) {
            let condName = "";
            const genC = GENERIC_CONDITIONS.find(c => c.id === data.condition);
            const tribeC = TRIBAL_CONDITIONS.find(c => c.id === data.condition);
            
            if (genC) condName = genC.name.en;
            if (tribeC) {
                condName = tribeC.name.en;
                // Replace [Tribe]
                const tribeName = gm.getTribes().find(t => t.id === data.conditionParam)?.name || "Tribe";
                condName = condName.replace("[Tribe]", tribeName);
            }
            text += `<i>${condName},</i> `;
        }

        // 3. Effect
        const effDef = EFFECTS.find(e => e.id === data.effect);
        let effText = effDef ? effDef.name.en : "Do Effect";

        // Substitutions
        if (data.keyword) {
            const kwName = KEYWORDS.find(k => k.id === data.keyword)?.name || "Keyword";
            effText = `Give ${kwName}`; // Simplified text override
        } else if (data.effectTribe) {
            const trName = gm.getTribes().find(t => t.id === data.effectTribe)?.name || "Tribe";
            effText = effText.replace("[Tribe]", trName);
        } else if (data.tokenData) {
            effText = `Summon a ${data.tokenData.attack}/${data.tokenData.health} ${data.tokenData.name}`;
        } else if (effText.includes("X")) {
            effText = effText.replace("X", data.value);
        } else if (effDef && effDef.requiresValue) {
            effText += ` ${data.value}`;
        }

        text += effText;

        // 4. Target
        const targDef = TARGETS.find(t => t.id === data.target);
        if (targDef && targDef.id !== 'none') {
            text += ` to ${targDef.name.en}`;
        }

        text += ".";
        this.ui.previewText.innerHTML = text;
    }

    /**
     * Collects form data into the Ability Object Structure.
     */
    scrapeData() {
        const tokenName = this.ui.tokenName.value || "Token";
        const tokenAtk = parseInt(this.ui.tokenAtk.value) || 1;
        const tokenHp = parseInt(this.ui.tokenHp.value) || 1;

        // Check if token logic is active to determine 'value' for math
        const effId = this.ui.effect.value;
        const effDef = EFFECTS.find(e => e.id === effId);
        
        let calculatedValue = parseInt(this.ui.valInput.value) || 0;
        
        // Special case: For tokens, the 'value' passed to math engine is sum of stats
        let tokenData = null;
        if (effDef && effDef.requiresTokenName) {
            calculatedValue = tokenAtk + tokenHp;
            tokenData = { name: tokenName, attack: tokenAtk, health: tokenHp };
        }

        return {
            flavorName: this.ui.flavorName.value,
            trigger: this.ui.trigger.value,
            condition: this.ui.condition.value === 'none' ? undefined : this.ui.condition.value,
            conditionParam: this.ui.condTribe.value,
            effect: effId,
            target: this.ui.target.value,
            value: calculatedValue, // The number used for cost calc
            keyword: this.ui.kwSelect.value,
            effectTribe: this.ui.effTribeSelect.value,
            tokenData: tokenData
        };
    }

    save() {
        if (this.onSaveCallback) {
            const data = this.scrapeData();
            this.onSaveCallback(data);
        }
        this.close();
    }
}

// Export Singleton
export const abilityBuilder = new AbilityBuilder();