import { KEYWORDS } from '../data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from '../data/abilities.js';
import { TRIBAL_CONDITIONS, TRIBAL_TARGETS, TRIBAL_EFFECTS } from '../data/tribal_rules.js';
import { gm } from './GameManager.js';

export class AbilityBuilder {

    /**
     * Creates a new visual row in the UI and sets up internal listeners.
     * @param {HTMLElement} container - The DOM element to append the row to.
     */
    static addRow(container) {
        const rowId = 'ab-' + Date.now();
        const row = document.createElement('div');
        row.className = 'ability-row';
        row.id = rowId;

        // --- 1. PREPARE OPTIONS ---
        const triggers = TRIGGERS.map(t => `<option value="${t.id}">${t.name.en}</option>`).join('');
        const targets = TARGETS.map(t => `<option value="${t.id}">${t.name.en}</option>`).join('');
        const keywords = KEYWORDS.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
        
        // Effects
        const effects = EFFECTS.map(e => `
            <option value="${e.id}" 
                data-req-val="${e.requiresValue || false}" 
                data-req-stats="${e.requiresStats || false}"
                data-req-keyword="${e.requiresKeywordSelect || false}"
                data-req-tribe="${e.requiresTribeSelect || false}"
                data-req-token="${e.requiresTokenName || false}"
            >${e.name.en}</option>`).join('');

        // Conditions (Generic + Tribal)
        let condOpts = `<option value="none">No Condition</option>`;
        condOpts += GENERIC_CONDITIONS.map(c => `<option value="${c.id}">${c.name.en}</option>`).join('');
        condOpts += `<optgroup label="Tribal">${TRIBAL_CONDITIONS.map(c => `<option value="${c.id}" data-req-tribe="true">${c.name.en}</option>`).join('')}</optgroup>`;

        // Tribes (From Game Manager)
        const currentTribes = gm.getTribes();
        const tribeOpts = currentTribes.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

        // --- 2. BUILD HTML ---
        row.innerHTML = `
            <div class="ability-row-header">
                <input type="text" class="ab-flavor-name" placeholder="Ability Name (e.g. Fireball)" title="Optional flavor name">
                <button type="button" class="btn-remove" data-target="${rowId}">X</button>
            </div>
            
            <div class="mad-libs-line">
                <span class="label-text">When:</span>
                <select class="ab-trigger">${triggers}</select>
            </div>

            <div class="mad-libs-line">
                <span class="label-text">If:</span>
                <select class="ab-condition">${condOpts}</select>
                <!-- Contextual: Tribe Selector for Condition -->
                <select class="ab-cond-tribe input-hidden">${tribeOpts}</select>
            </div>

            <div class="mad-libs-line">
                <span class="label-text">Do:</span>
                <select class="ab-effect">${effects}</select>
                
                <!-- Contextual Inputs -->
                <input type="number" class="ab-value input-sm input-hidden" placeholder="Val" value="1">
                <select class="ab-keyword input-hidden">${keywords}</select>
                <select class="ab-effect-tribe input-hidden">${tribeOpts}</select>
            </div>

            <!-- Token Specific Line (Hidden by default) -->
            <div class="mad-libs-line token-line input-hidden">
                <input type="text" class="ab-token-name" placeholder="Token Name">
                <input type="number" class="ab-token-atk input-xs" placeholder="Atk" value="1">
                <span>/</span>
                <input type="number" class="ab-token-hp input-xs" placeholder="HP" value="1">
            </div>

            <div class="mad-libs-line">
                <span class="label-text">To:</span>
                <select class="ab-target">${targets}</select>
            </div>
        `;

        container.appendChild(row);

        // --- 3. BIND EVENTS ---
        this.bindEvents(row);
    }

    static bindEvents(row) {
        // Remove Button
        row.querySelector('.btn-remove').addEventListener('click', () => {
            row.remove();
            // Trigger global update (we dispatch an input event on the main form)
            document.getElementById('cardForm').dispatchEvent(new Event('input'));
        });

        // 1. Condition Change -> Show/Hide Tribe Selector
        const condSelect = row.querySelector('.ab-condition');
        const condTribe = row.querySelector('.ab-cond-tribe');
        
        condSelect.addEventListener('change', () => {
            const selected = condSelect.options[condSelect.selectedIndex];
            if (selected.dataset.reqTribe === "true") {
                condTribe.classList.remove('input-hidden');
            } else {
                condTribe.classList.add('input-hidden');
            }
        });

        // 2. Effect Change -> Show/Hide Inputs
        const effectSelect = row.querySelector('.ab-effect');
        const valInput = row.querySelector('.ab-value');
        const kwSelect = row.querySelector('.ab-keyword');
        const tribeSelect = row.querySelector('.ab-effect-tribe');
        const tokenLine = row.querySelector('.token-line');

        effectSelect.addEventListener('change', () => {
            const opt = effectSelect.options[effectSelect.selectedIndex];
            const d = opt.dataset;

            // Reset visibility
            valInput.classList.add('input-hidden');
            kwSelect.classList.add('input-hidden');
            tribeSelect.classList.add('input-hidden');
            tokenLine.classList.add('input-hidden');

            // Toggle based on flags
            if (d.reqVal === "true") {
                valInput.classList.remove('input-hidden');
                valInput.placeholder = "Value";
            }
            if (d.reqStats === "true" && d.reqToken !== "true") {
                // E.g. Give +X/+X (Uses single value for now, or we can expand)
                // For simplified "Give Stats", we often treat Value as total stats or just +X/+X
                // Let's reuse valInput for single number stat buffs for now
                valInput.classList.remove('input-hidden'); 
                valInput.placeholder = "Stat Sum";
            }
            if (d.reqKeyword === "true") {
                kwSelect.classList.remove('input-hidden');
            }
            if (d.reqTribe === "true") {
                tribeSelect.classList.remove('input-hidden');
            }
            if (d.reqToken === "true") {
                tokenLine.classList.remove('input-hidden');
            }
        });

        // Initial Trigger
        effectSelect.dispatchEvent(new Event('change'));
        condSelect.dispatchEvent(new Event('change'));
    }

    /**
     * Scrapes all rows in the container and returns the Ability Data Array.
     */
    static getAbilities(container) {
        const rows = container.querySelectorAll('.ability-row');
        const abilities = [];

        rows.forEach(row => {
            const flavorName = row.querySelector('.ab-flavor-name').value;
            const trigger = row.querySelector('.ab-trigger').value;
            const target = row.querySelector('.ab-target').value;
            
            // Condition Logic
            let condition = row.querySelector('.ab-condition').value;
            if (condition === 'none') condition = undefined;
            const conditionParam = row.querySelector('.ab-cond-tribe').value; // Tribe ID

            // Effect Logic
            const effectSelect = row.querySelector('.ab-effect');
            const effectId = effectSelect.value;
            
            // Extract Values based on visibility
            let value = parseInt(row.querySelector('.ab-value').value) || 0;
            const keyword = row.querySelector('.ab-keyword').value;
            const effectTribe = row.querySelector('.ab-effect-tribe').value;
            
            // Token Data
            const tokenName = row.querySelector('.ab-token-name').value;
            const tokenAtk = parseInt(row.querySelector('.ab-token-atk').value) || 0;
            const tokenHp = parseInt(row.querySelector('.ab-token-hp').value) || 0;

            // If it's a token summon, 'value' for the calculator is Sum of Stats
            if (!row.querySelector('.token-line').classList.contains('input-hidden')) {
                value = tokenAtk + tokenHp;
            }

            abilities.push({
                flavorName,
                trigger,
                target,
                condition,
                conditionParam, // New: Stores the specific tribe for the condition
                effect: effectId,
                value,
                keyword,
                effectTribe,
                tokenData: { name: tokenName, attack: tokenAtk, health: tokenHp }
            });
        });

        return abilities;
    }
}