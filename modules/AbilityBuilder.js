import { KEYWORDS } from '../data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from '../data/abilities.js';
import { TRIBAL_CONDITIONS, TRIBAL_TARGETS } from '../data/tribal_rules.js';
import { gm } from './GameManager.js';

export class AbilityBuilder {
    constructor() {
        this.ui = {};
        this.onSaveCallback = null;
    }

    init() {
        // Map DOM elements inside the MODAL
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
            
            // Dynamic Inputs
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
        if (!this.ui.modal) {
            console.error("AbilityBuilder: Modal not found in DOM");
            return;
        }

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
            if(el) {
                el.addEventListener('input', () => this.updatePreview());
                el.addEventListener('change', () => this.updateLogic());
            }
        });
    }

    open(saveCallback) {
        this.onSaveCallback = saveCallback;
        this.populateDropdowns();
        this.resetForm();
        this.ui.modal.classList.remove('hidden');
        this.updateLogic(); 
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

        // 2. Conditions
        this.ui.condition.innerHTML = '';
        this.ui.condition.appendChild(createOpt('none', 'No Condition'));
        
        const grpGen = document.createElement('optgroup');
        grpGen.label = "Generic";
        GENERIC_CONDITIONS.forEach(c => grpGen.appendChild(createOpt(c.id, c.name.en)));
        this.ui.condition.appendChild(grpGen);

        const grpTribe = document.createElement('optgroup');
        grpTribe.label = "Tribal";
        TRIBAL_CONDITIONS.forEach(c => {
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

        // 5. Context Helpers
        const tribes = gm.getTribes();
        const fillTribes = (el) => {
            el.innerHTML = '';
            tribes.forEach(t => el.appendChild(createOpt(t.id, t.name.en)));
        };
        fillTribes(this.ui.condTribe);
        fillTribes(this.ui.effTribeSelect);

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

    updateLogic() {
        // 1. Description
        const trigOpt = this.ui.trigger.options[this.ui.trigger.selectedIndex];
        this.ui.descTrigger.textContent = trigOpt ? (trigOpt.dataset.desc || "") : "";

        // 2. Condition
        const condOpt = this.ui.condition.options[this.ui.condition.selectedIndex];
        const condReqTribe = condOpt && condOpt.dataset.reqTribe === "true";
        if (condReqTribe) this.ui.condTribe.classList.remove('input-hidden');
        else this.ui.condTribe.classList.add('input-hidden');

        // 3. Effect
        const effOpt = this.ui.effect.options[this.ui.effect.selectedIndex];
        if(!effOpt) return;
        
        const d = effOpt.dataset;

        // Reset visibility
        this.ui.valInput.classList.add('input-hidden');
        this.ui.kwSelect.classList.add('input-hidden');
        this.ui.effTribeSelect.classList.add('input-hidden');
        this.ui.tokenBox.classList.add('input-hidden');

        if (d.reqVal === "true") {
            this.ui.valInput.classList.remove('input-hidden');
            this.ui.valInput.placeholder = "Value";
        }
        if (d.reqStats === "true" && d.reqToken !== "true") {
            this.ui.valInput.classList.remove('input-hidden');
            this.ui.valInput.placeholder = "Stat Sum (+X/+X)";
        }
        if (d.reqKeyword === "true") this.ui.kwSelect.classList.remove('input-hidden');
        if (d.reqTribe === "true") this.ui.effTribeSelect.classList.remove('input-hidden');
        if (d.reqToken === "true") this.ui.tokenBox.classList.remove('input-hidden');

        this.updatePreview();
    }

    updatePreview() {
        const data = this.scrapeData();
        // (Simplified preview generation for brevity, logic remains same as before)
        let text = "";
        if (data.flavorName) text += `<b>${data.flavorName}</b>: `;
        
        const effDef = EFFECTS.find(e => e.id === data.effect);
        text += effDef ? effDef.name.en : "Do Effect";
        
        if(effDef && effDef.requiresValue) text += ` ${data.value}`;
        
        this.ui.previewText.innerHTML = text + ".";
    }

    scrapeData() {
        const tokenName = this.ui.tokenName.value || "Token";
        const tokenAtk = parseInt(this.ui.tokenAtk.value) || 1;
        const tokenHp = parseInt(this.ui.tokenHp.value) || 1;

        const effId = this.ui.effect.value;
        const effDef = EFFECTS.find(e => e.id === effId);
        
        let calculatedValue = parseInt(this.ui.valInput.value) || 0;
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
            value: calculatedValue,
            keyword: this.ui.kwSelect.value,
            effectTribe: this.ui.effTribeSelect.value,
            tokenData: tokenData
        };
    }

    save() {
        if (this.onSaveCallback) {
            this.onSaveCallback(this.scrapeData());
        }
        this.close();
    }
}

export const abilityBuilder = new AbilityBuilder();