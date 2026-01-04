import { KEYWORDS } from '../data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from '../data/abilities.js';
import { TRIBAL_CONDITIONS } from '../data/tribal_rules.js';
import { gm } from './GameManager.js';
import { lang } from './LanguageManager.js';

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
        if (!this.ui.modal) return;

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
        // Re-populate dropdowns to ensure current language is used
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
            opt.textContent = text || "Unknown";
            Object.entries(dataset).forEach(([k, v]) => opt.dataset[k] = v);
            return opt;
        };

        // 1. Triggers
        this.ui.trigger.innerHTML = '';
        TRIGGERS.forEach(t => {
            this.ui.trigger.appendChild(createOpt(t.id, lang.translate(t.name), { desc: lang.translate(t.description) }));
        });

        // 2. Conditions
        this.ui.condition.innerHTML = '';
        this.ui.condition.appendChild(createOpt('none', lang.getText('ui_ab_opt_none')));
        
        const grpGen = document.createElement('optgroup');
        grpGen.label = lang.getText('ui_ab_grp_generic');
        GENERIC_CONDITIONS.forEach(c => grpGen.appendChild(createOpt(c.id, lang.translate(c.name))));
        this.ui.condition.appendChild(grpGen);

        const grpTribe = document.createElement('optgroup');
        grpTribe.label = lang.getText('ui_ab_grp_tribal');
        TRIBAL_CONDITIONS.forEach(c => {
            grpTribe.appendChild(createOpt(c.id, lang.translate(c.name), { reqTribe: c.requiresParam }));
        });
        this.ui.condition.appendChild(grpTribe);

        // 3. Effects
        this.ui.effect.innerHTML = '';
        EFFECTS.forEach(e => {
            this.ui.effect.appendChild(createOpt(e.id, lang.translate(e.name), {
                reqVal: e.requiresValue || false,
                reqStats: e.requiresStats || false,
                reqKeyword: e.requiresKeywordSelect || false,
                reqTribe: e.requiresTribeSelect || false,
                reqToken: e.requiresTokenName || false
            }));
        });

        // 4. Targets
        this.ui.target.innerHTML = '';
        TARGETS.forEach(t => this.ui.target.appendChild(createOpt(t.id, lang.translate(t.name))));

        // 5. Context Helpers
        const tribes = gm.getTribes();
        const fillTribes = (el) => {
            el.innerHTML = '';
            tribes.forEach(t => el.appendChild(createOpt(t.id, lang.translate(t.name)))); // Tribes can have names in config, but defaults have en/es
        };
        fillTribes(this.ui.condTribe);
        fillTribes(this.ui.effTribeSelect);

        this.ui.kwSelect.innerHTML = '';
        KEYWORDS.forEach(k => this.ui.kwSelect.appendChild(createOpt(k.id, lang.translate(k.name))));
    }

    resetForm() {
        this.ui.flavorName.value = '';
        if(this.ui.trigger.options.length > 0) this.ui.trigger.selectedIndex = 0;
        this.ui.condition.value = 'none';
        if(this.ui.effect.options.length > 0) this.ui.effect.selectedIndex = 0;
        if(this.ui.target.options.length > 0) this.ui.target.selectedIndex = 0;
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

        // Toggle specific inputs based on dataset flags
        if (d.reqVal === "true") {
            this.ui.valInput.classList.remove('input-hidden');
            this.ui.valInput.placeholder = "Value";
        }
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

    updatePreview() {
        const data = this.scrapeData();
        
        let text = "";
        
        // Trigger
        const trig = TRIGGERS.find(t => t.id === data.trigger);
        const trigName = lang.translate(trig?.name) || "Ability";

        if (data.flavorName) {
            text += `<b>${data.flavorName}</b>`;
            if (data.trigger !== 'passive') {
                text += ` (${trigName}): `;
            } else {
                text += `: `;
            }
        } else {
            if (data.trigger !== 'passive') text += `<b>${trigName}:</b> `;
        }

        // Condition
        if (data.condition) {
            let condName = "";
            const genC = GENERIC_CONDITIONS.find(c => c.id === data.condition);
            const tribeC = TRIBAL_CONDITIONS.find(c => c.id === data.condition);
            
            if (genC) condName = lang.translate(genC.name);
            if (tribeC) {
                condName = lang.translate(tribeC.name);
                const tribeObj = gm.getTribes().find(t => t.id === data.conditionParam);
                const tribeName = lang.translate(tribeObj?.name) || "Tribe";
                condName = condName.replace("[Tribe]", tribeName);
            }
            text += `<i>${condName},</i> `;
        }

        // Effect
        const effDef = EFFECTS.find(e => e.id === data.effect);
        let effText = effDef ? lang.translate(effDef.name) : "Do Effect";

        if (data.keyword) {
            const kwObj = KEYWORDS.find(k => k.id === data.keyword);
            const kName = lang.translate(kwObj?.name) || "Keyword";
            // Hard to translate "Give" dynamically without complex logic, so we simplify
            // "Give Keyword" -> "Dar Provocar" works if effText is "Dar Palabra Clave"
            // We assume effText is e.g. "Give Keyword", we replace "Keyword" with specific one
            // Or simplified replacement:
            effText = effText.replace("Keyword", kName).replace("Palabra Clave", kName);
        } else if (data.effectTribe) {
            const trObj = gm.getTribes().find(t => t.id === data.effectTribe);
            const trName = lang.translate(trObj?.name) || "Tribe";
            effText = effText.replace("[Tribe]", trName).replace("[Tribu]", trName);
        } else if (data.tokenData) {
            // Localization for "Summon a" is hard. We can construct it:
            // "Summon Token" -> "Summon a 2/2 Zombie"
            // "Invocar Ficha" -> "Invoca un Zombi 2/2"
            // For now, appending string:
            const tokenStr = `${data.tokenData.attack}/${data.tokenData.health} ${data.tokenData.name}`;
            effText = effText.replace("Token", tokenStr).replace("Ficha", tokenStr);
        } else if (effText.includes("X")) {
            effText = effText.replace("X", data.value);
        } else if (effDef && effDef.requiresValue) {
            effText += ` ${data.value}`;
        }

        text += effText;

        // Target
        const targDef = TARGETS.find(t => t.id === data.target);
        if (targDef && targDef.id !== 'none') {
            const prep = lang.code === 'es' ? " a " : " to ";
            text += `${prep}${lang.translate(targDef.name)}`;
        }

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