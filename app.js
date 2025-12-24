import { RARITIES } from './data/rarities.js';
import { KEYWORDS } from './data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from './data/abilities.js';
import { TRIBAL_CONDITIONS, TRIBAL_TARGETS } from './data/tribal_rules.js';
import { ManaCalculator } from './modules/ManaCalculator.js';
import { gm } from './modules/GameManager.js';
import { abilityBuilder } from './modules/AbilityBuilder.js'; 

console.log("Card Forge Initializing...");

// --- 1. GLOBAL STATE ---
let currentCard = {
    name: "New Hero",
    type: "minion",
    rarity: "common",
    tribe: "neutral",
    stats: { attack: 0, health: 1 },
    keywords: {},
    abilities: [], 
    flavorText: "",
    image: null
};

// --- 2. DOM ELEMENTS ---
const ui = {
    form: document.getElementById('cardForm'),
    
    // Header & Settings
    btnOpenSettings: document.getElementById('btnOpenSettings'),
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    
    // Settings UI
    btnLoadMidgard: document.getElementById('btnLoadMidgard'),
    settingsTribeList: document.getElementById('settingsTribeList'),
    btnAddTribe: document.getElementById('btnAddTribe'),
    newTribeName: document.getElementById('newTribeName'),
    newTribeColor: document.getElementById('newTribeColor'),

    // Card Inputs
    name: document.getElementById('cardName'),
    type: document.getElementById('cardType'),
    rarity: document.getElementById('cardRarity'),
    tribe: document.getElementById('cardTribe'),
    imageUpload: document.getElementById('imageUpload'),
    attack: document.getElementById('statAttack'),
    health: document.getElementById('statHealth'),
    flavor: document.getElementById('cardFlavor'),
    keywordContainer: document.getElementById('keyword-container'),
    
    // Ability Section (FIXED: Removed old IDs)
    abilitiesListSummary: document.getElementById('abilitiesListSummary'),
    btnOpenAbilityModal: document.getElementById('btnOpenAbilityModal'),

    // Dynamic Labels
    statsSection: document.getElementById('stats-section'),
    healthLabel: document.getElementById('lbl-health'),
    valAttack: document.getElementById('val-attack'),
    valHealth: document.getElementById('val-health'),

    // Preview
    pFrame: document.getElementById('cardPreview'),
    pName: document.getElementById('previewName'),
    pMana: document.getElementById('previewMana'),
    pTribe: document.getElementById('previewTribe'),
    pText: document.getElementById('previewText'),
    pFlavor: document.getElementById('previewFlavor'),
    pAttack: document.getElementById('previewAttack'),
    pHealth: document.getElementById('previewHealth'),
    pArt: document.getElementById('previewArt'),
    pArtPlaceholder: document.getElementById('previewArtPlaceholder'),
    
    // Export & Log
    btnSaveJSON: document.getElementById('btnSaveJSON'),
    btnSaveImage: document.getElementById('btnSaveImage'),
    log: document.getElementById('balanceLog')
};

// --- 3. INITIALIZATION ---
function init() {
    abilityBuilder.init(); 
    populateDropdowns();
    setupEventListeners();
    updateCardState(); 
}

function populateDropdowns() {
    // Rarities
    ui.rarity.innerHTML = '';
    RARITIES.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name;
        ui.rarity.appendChild(opt);
    });

    // Tribes
    ui.tribe.innerHTML = '';
    const tribes = gm.getTribes();
    tribes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        ui.tribe.appendChild(opt);
    });

    // Default selection
    if (tribes.find(t => t.id === currentCard.tribe)) {
        ui.tribe.value = currentCard.tribe;
    } else {
        ui.tribe.value = tribes[0]?.id || "neutral";
    }

    // Keywords
    if (ui.keywordContainer.children.length === 0) {
        KEYWORDS.forEach(k => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.title = k.description; 
            div.innerHTML = `
                <input type="checkbox" id="kw-${k.id}" value="${k.id}" class="keyword-check">
                <label for="kw-${k.id}">${k.name}</label>
            `;
            ui.keywordContainer.appendChild(div);
        });
    }
}

function setupEventListeners() {
    // Form Input
    ui.form.addEventListener('input', (e) => {
        if(e.target.id !== 'imageUpload') updateCardState();
    });

    ui.type.addEventListener('change', handleTypeChange);
    
    // Ability Modal Trigger
    if(ui.btnOpenAbilityModal) {
        ui.btnOpenAbilityModal.addEventListener('click', () => {
            abilityBuilder.open((newAbilityData) => {
                // Add to state
                currentCard.abilities.push(newAbilityData);
                // Render list
                renderAbilitiesSummary();
                // Recalculate
                updateCardState();
            });
        });
    }

    ui.imageUpload.addEventListener('change', handleImageUpload);
    ui.btnSaveJSON.addEventListener('click', downloadJSON);
    ui.btnSaveImage.addEventListener('click', downloadImage);

    // Settings Modal
    ui.btnOpenSettings.addEventListener('click', openSettings);
    ui.btnCloseSettings.addEventListener('click', closeSettings);
    ui.btnSaveSettings.addEventListener('click', closeSettings);
    
    ui.btnLoadMidgard.addEventListener('click', () => {
        if(confirm("Reset to Midgard TCG defaults?")) {
            gm.resetToPreset('midgard');
            renderTribeSettingsList();
            populateDropdowns();
            updateCardState();
        }
    });

    ui.btnAddTribe.addEventListener('click', () => {
        const name = ui.newTribeName.value.trim();
        const color = ui.newTribeColor.value;
        if (name) {
            gm.addTribe(name, color);
            ui.newTribeName.value = '';
            renderTribeSettingsList();
        }
    });
}

// --- 4. ABILITY LIST MANAGEMENT ---

function renderAbilitiesSummary() {
    ui.abilitiesListSummary.innerHTML = '';
    
    currentCard.abilities.forEach((ab, index) => {
        const item = document.createElement('div');
        item.className = 'ability-summary-item';
        
        const triggerName = TRIGGERS.find(t => t.id === ab.trigger)?.name.en || "Ability";
        const label = ab.flavorName || triggerName;
        
        item.innerHTML = `
            <span class="summary-text"><b>${label}</b></span>
            <button type="button" class="btn-remove-sm" data-idx="${index}">X</button>
        `;
        
        ui.abilitiesListSummary.appendChild(item);
    });

    document.querySelectorAll('.btn-remove-sm').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            currentCard.abilities.splice(idx, 1);
            renderAbilitiesSummary();
            updateCardState();
        });
    });
}

// --- 5. SETTINGS LOGIC ---

function openSettings() {
    renderTribeSettingsList();
    ui.settingsModal.classList.remove('hidden');
}

function closeSettings() {
    ui.settingsModal.classList.add('hidden');
    populateDropdowns(); 
    updateCardState();
}

function renderTribeSettingsList() {
    ui.settingsTribeList.innerHTML = '';
    const tribes = gm.getTribes();

    tribes.forEach(tribe => {
        const row = document.createElement('div');
        row.className = 'tribe-row';
        row.innerHTML = `
            <input type="color" value="${tribe.color}" class="edit-color" data-id="${tribe.id}">
            <input type="text" value="${tribe.name}" class="edit-name" data-id="${tribe.id}">
            ${tribe.id !== 'neutral' ? `<button class="btn-remove delete-tribe" data-id="${tribe.id}">X</button>` : ''}
        `;
        ui.settingsTribeList.appendChild(row);
    });

    // ... (Bind settings listeners here same as before) ...
    // Simplified for brevity, assume gm.updateTribe calls exist
    document.querySelectorAll('.edit-name').forEach(el => {
        el.addEventListener('change', (e) => gm.updateTribe(e.target.dataset.id, { name: e.target.value }));
    });
}

// --- 6. CORE UPDATE LOOP ---

function handleTypeChange() {
    const type = ui.type.value;
    if (type === 'spell') {
        ui.statsSection.style.display = 'none';
        ui.pAttack.style.display = 'none';
        ui.pHealth.style.display = 'none';
    } else {
        ui.statsSection.style.display = 'flex';
        ui.pAttack.style.display = 'flex';
        ui.pHealth.style.display = 'flex';
        ui.healthLabel.textContent = (type === 'weapon') ? "Durability" : "Health";
    }
    updateCardState();
}

function updateCardState() {
    // 1. Scrape Standard Inputs
    currentCard.name = ui.name.value || "New Hero";
    currentCard.rarity = ui.rarity.value;
    currentCard.tribe = ui.tribe.value;
    currentCard.flavorText = ui.flavor.value;
    currentCard.type = ui.type.value;

    if (currentCard.type === 'spell') {
        currentCard.stats.attack = 0;
        currentCard.stats.health = 0;
    } else {
        currentCard.stats.attack = parseInt(ui.attack.value) || 0;
        currentCard.stats.health = parseInt(ui.health.value) || 1;
    }

    currentCard.keywords = {};
    document.querySelectorAll('.keyword-check:checked').forEach(chk => {
        currentCard.keywords[chk.value] = true;
    });

    // NOTE: We do NOT scrape abilities here anymore. They are in currentCard.abilities.

    // 2. Calculate Balance
    const report = ManaCalculator.calculate(currentCard);

    // 3. Render
    renderPreview(report);
    renderLog(report);
}

function renderPreview(report) {
    ui.pName.textContent = currentCard.name;
    ui.pMana.textContent = report.manaCost;
    ui.pFlavor.textContent = currentCard.flavorText;
    
    ui.valAttack.textContent = currentCard.stats.attack;
    ui.valHealth.textContent = currentCard.stats.health;
    ui.pAttack.textContent = currentCard.stats.attack;
    ui.pHealth.textContent = currentCard.stats.health;

    const tribes = gm.getTribes();
    const tribeData = tribes.find(t => t.id === currentCard.tribe) || tribes[0];
    ui.pTribe.textContent = tribeData.name;

    if (currentCard.image) {
        ui.pArt.src = currentCard.image;
        ui.pArt.style.display = 'block';
        ui.pArtPlaceholder.style.display = 'none';
    } else {
        ui.pArt.style.display = 'none';
        ui.pArtPlaceholder.style.display = 'flex';
    }

    // Rules Text
    let ruleHtml = "";
    
    // Keywords
    const kws = Object.keys(currentCard.keywords)
        .map(kId => KEYWORDS.find(k => k.id === kId)?.name || kId);
    if (kws.length) ruleHtml += `<b>${kws.join(', ')}</b>. <br>`;

    // Abilities
    currentCard.abilities.forEach(ab => {
        ruleHtml += generateAbilityText(ab) + "<br>";
    });

    ui.pText.innerHTML = ruleHtml;

    // Visuals
    ui.pFrame.className = `card-frame rarity-${currentCard.rarity} type-${currentCard.type}`;
    if (tribeData && tribeData.color) {
        ui.pFrame.style.borderColor = tribeData.color;
    } else {
        ui.pFrame.style.borderColor = ''; 
    }
}

function generateAbilityText(ab) {
    const tribes = gm.getTribes();
    const trig = TRIGGERS.find(t => t.id === ab.trigger);
    const eff = EFFECTS.find(e => e.id === ab.effect);
    const targ = TARGETS.find(t => t.id === ab.target);
    
    let text = "";
    
    // 1. Trigger / Flavor
    if (trig.id !== 'passive') {
        if (ab.flavorName && ab.flavorName.trim() !== "") {
            text += `<b>${ab.flavorName} (${trig.name.en}):</b> `;
        } else {
            text += `<b>${trig.name.en}:</b> `;
        }
    } else {
        if (ab.flavorName) text += `<b>${ab.flavorName}:</b> `;
    }
    
    // 2. Condition
    if (ab.condition) {
        const genCond = GENERIC_CONDITIONS.find(c => c.id === ab.condition);
        const tribeCond = TRIBAL_CONDITIONS.find(c => c.id === ab.condition);
        let condName = genCond ? genCond.name.en : (tribeCond ? tribeCond.name.en : "");
        
        if (condName.includes("[Tribe]") && ab.conditionParam) {
            const cTribe = tribes.find(t => t.id === ab.conditionParam);
            condName = condName.replace("[Tribe]", cTribe ? cTribe.name : "Tribe");
        }
        text += `<i>(${condName})</i> `;
    }

    // 3. Effect
    let effText = eff.name.en;
    if (effText.includes("[Tribe]") && ab.effectTribe) {
        const eTribe = tribes.find(t => t.id === ab.effectTribe);
        effText = effText.replace("[Tribe]", eTribe ? eTribe.name : "Tribe");
    }

    if (eff.id === 'summon_token' && ab.tokenData) {
        effText = `Summon a ${ab.tokenData.attack}/${ab.tokenData.health} ${ab.tokenData.name}`;
    } else if (eff.id === 'give_keyword' && ab.keyword) {
        const kName = KEYWORDS.find(k => k.id === ab.keyword)?.name || "Keyword";
        effText = `Give ${kName}`;
    } else if (effText.includes("X")) {
        effText = effText.replace('X', ab.value);
    } else {
        if (eff.requiresValue) effText += ` ${ab.value}`;
    }
    text += effText;

    // 4. Target
    if (targ.id !== 'none') {
        text += ` to ${targ.name.en}`;
    }
    
    return text + ".";
}

function renderLog(report) {
    let html = `<strong>Mana Cost: ${report.manaCost}</strong><br>`;
    html += `<small>Total VP: ${report.totalVP.toFixed(1)}</small><hr>`;
    html += `Base: ${report.breakdown.base}<br>`;
    if(report.breakdown.stats) html += `Stats: ${report.breakdown.stats}<br>`;
    if(report.breakdown.keywords) html += `Keywords: ${report.breakdown.keywords}<br>`;
    if(report.breakdown.abilities) html += `Abilities: ${report.breakdown.abilities.toFixed(1)}<br>`;
    if(report.breakdown.rarityDiscount) html += `<span style="color:green">Rarity: -${report.breakdown.rarityDiscount}</span><br>`;
    
    ui.log.innerHTML = html;
}

// Asset Handling Helpers
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        currentCard.image = event.target.result; 
        updateCardState();
    };
    reader.readAsDataURL(file);
}

function downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentCard, null, 2));
    const node = document.createElement('a');
    node.setAttribute("href", dataStr);
    node.setAttribute("download", `${currentCard.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(node);
    node.click();
    node.remove();
}

function downloadImage() {
    const node = document.querySelector('.card-render-area');
    if (window.htmlToImage) {
        window.htmlToImage.toPng(node)
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${currentCard.name.replace(/\s+/g, '_')}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => console.error(err));
    }
}

init();