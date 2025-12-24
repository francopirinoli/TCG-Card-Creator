import { RARITIES } from './data/rarities.js';
import { KEYWORDS } from './data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from './data/abilities.js';
import { TRIBAL_CONDITIONS } from './data/tribal_rules.js';
import { ManaCalculator } from './modules/ManaCalculator.js';
import { gm } from './modules/GameManager.js';
import { abilityBuilder } from './modules/AbilityBuilder.js'; // The Modal Controller

console.log("Card Forge Initializing...");

// --- 1. GLOBAL STATE ---
let currentCard = {
    name: "New Hero",
    type: "minion",
    rarity: "common",
    tribe: "neutral",
    stats: { attack: 0, health: 1 },
    keywords: {},
    abilities: [], // Stores ability objects
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
    
    // Ability Section (The Summary List)
    abilitiesListSummary: document.getElementById('abilitiesListSummary'),
    btnOpenAbilityModal: document.getElementById('btnOpenAbilityModal'),

    // Dynamic Labels
    statsSection: document.getElementById('stats-section'),
    healthLabel: document.getElementById('lbl-health'),
    valAttack: document.getElementById('val-attack'),
    valHealth: document.getElementById('val-health'),

    // Preview Elements
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
    abilityBuilder.init(); // Bind modal events
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

    // Tribes (From GameManager)
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

    // Keywords (One time gen)
    if (ui.keywordContainer.children.length === 0) {
        KEYWORDS.forEach(k => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.title = k.description; // Tooltip added
            div.innerHTML = `
                <input type="checkbox" id="kw-${k.id}" value="${k.id}" class="keyword-check">
                <label for="kw-${k.id}">${k.name}</label>
            `;
            ui.keywordContainer.appendChild(div);
        });
    }
}

function setupEventListeners() {
    // Main Form Delegation
    ui.form.addEventListener('input', (e) => {
        if(e.target.id !== 'imageUpload') updateCardState();
    });

    ui.type.addEventListener('change', handleTypeChange);
    
    // --- ABILITY FLOW ---
    ui.btnOpenAbilityModal.addEventListener('click', () => {
        // Open Modal, pass callback to receive data
        abilityBuilder.open((newAbilityData) => {
            currentCard.abilities.push(newAbilityData);
            renderAbilitiesSummary();
            updateCardState();
        });
    });

    // Asset & Export
    ui.imageUpload.addEventListener('change', handleImageUpload);
    ui.btnSaveJSON.addEventListener('click', downloadJSON);
    ui.btnSaveImage.addEventListener('click', downloadImage);

    // --- SETTINGS MODAL ---
    ui.btnOpenSettings.addEventListener('click', openSettings);
    ui.btnCloseSettings.addEventListener('click', closeSettings);
    ui.btnSaveSettings.addEventListener('click', closeSettings);
    
    ui.btnLoadMidgard.addEventListener('click', () => {
        if(confirm("Reset configuration to Midgard TCG defaults?")) {
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
        
        // Generate a short preview string
        const triggerName = TRIGGERS.find(t => t.id === ab.trigger)?.name.en || "Passive";
        const flavor = ab.flavorName ? `<b>${ab.flavorName}</b>` : `<b>${triggerName}</b>`;
        
        item.innerHTML = `
            <span class="summary-text">${flavor}: ...</span>
            <button type="button" class="btn-remove-sm" data-idx="${index}">X</button>
        `;
        
        ui.abilitiesListSummary.appendChild(item);
    });

    // Bind delete buttons
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

    document.querySelectorAll('.edit-color').forEach(el => {
        el.addEventListener('change', (e) => gm.updateTribe(e.target.dataset.id, { color: e.target.value }));
    });
    document.querySelectorAll('.edit-name').forEach(el => {
        el.addEventListener('input', (e) => gm.updateTribe(e.target.dataset.id, { name: e.target.value }));
    });
    document.querySelectorAll('.delete-tribe').forEach(el => {
        el.addEventListener('click', (e) => {
            gm.deleteTribe(e.target.dataset.id);
            renderTribeSettingsList();
        });
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
        currentCard.stats.attack = parseInt(ui.attack.value);
        currentCard.stats.health = parseInt(ui.health.value);
    }

    currentCard.keywords = {};
    document.querySelectorAll('.keyword-check:checked').forEach(chk => {
        currentCard.keywords[chk.value] = true;
    });

    // Note: currentCard.abilities is already updated by the Modal callback

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

    // --- RULES TEXT GENERATION ---
    let ruleHtml = "";
    
    // Keywords
    const kws = Object.keys(currentCard.keywords)
        .map(kId => KEYWORDS.find(k => k.id === kId)?.name || kId);
    if (kws.length) ruleHtml += `<b>${kws.join(', ')}</b>. <br>`;

    // Abilities Text Generation
    currentCard.abilities.forEach(ab => {
        ruleHtml += generateAbilityText(ab) + "<br>";
    });

    ui.pText.innerHTML = ruleHtml;

    // Visuals & Colors
    ui.pFrame.className = `card-frame rarity-${currentCard.rarity} type-${currentCard.type}`;
    if (tribeData && tribeData.color) {
        ui.pFrame.style.borderColor = tribeData.color;
    } else {
        ui.pFrame.style.borderColor = ''; 
    }
}

// Helper to generate the text string for an ability (Shared logic with Modal preview)
function generateAbilityText(ab) {
    const tribes = gm.getTribes();
    const trig = TRIGGERS.find(t => t.id === ab.trigger);
    const eff = EFFECTS.find(e => e.id === ab.effect);
    const targ = TARGETS.find(t => t.id === ab.target);
    
    let text = "";
    
    // 1. Trigger
    if (trig.id !== 'passive') {
        if (ab.flavorName && ab.flavorName.trim() !== "") {
            text += `<b>${ab.flavorName} (${trig.name.en}):</b> `;
        } else {
            text += `<b>${trig.name.en}:</b> `;
        }
    } else {
        if (ab.flavorName && ab.flavorName.trim() !== "") {
            text += `<b>${ab.flavorName}:</b> `;
        }
    }
    
    // 2. Condition
    if (ab.condition) {
        const genCond = GENERIC_CONDITIONS.find(c => c.id === ab.condition);
        const tribeCond = TRIBAL_CONDITIONS.find(c => c.id === ab.condition);
        
        let condName = genCond ? genCond.name.en : (tribeCond ? tribeCond.name.en : "");
        
        if (condName.includes("[Tribe]") && ab.conditionParam) {
            const cTribe = tribes.find(t => t.id === ab.conditionParam);
            const cTribeName = cTribe ? cTribe.name : "Tribe";
            condName = condName.replace("[Tribe]", cTribeName);
        }
        text += `<i>(${condName})</i> `;
    }

    // 3. Effect
    let effText = eff.name.en;

    if (effText.includes("[Tribe]") && ab.effectTribe) {
        const eTribe = tribes.find(t => t.id === ab.effectTribe);
        const eTribeName = eTribe ? eTribe.name : "Tribe";
        effText = effText.replace("[Tribe]", eTribeName);
    }

    if (eff.id === 'summon_token' && ab.tokenData) {
        effText = `Summon a ${ab.tokenData.attack}/${ab.tokenData.health} ${ab.tokenData.name}`;
    } else if (eff.id === 'give_keyword' && ab.keyword) {
        const kName = KEYWORDS.find(k => k.id === ab.keyword)?.name || "Keyword";
        effText = `Give ${kName}`;
    } else if (effText.includes("X")) {
        effText = effText.replace('X', ab.value);
    } else {
        effText = effText + (eff.requiresValue ? ` ${ab.value}` : "");
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
    if(report.breakdown.typeMod && report.breakdown.typeMod !== 0) {
        html += `Type Mod: ${report.breakdown.typeMod.toFixed(1)}<br>`;
    }
    
    if (report.warnings.length > 0) {
        html += `<hr><span style="color:red">${report.warnings.join('<br>')}</span>`;
    }

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
    } else {
        alert("Image export library not loaded.");
    }
}

init();