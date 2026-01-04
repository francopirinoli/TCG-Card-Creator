import { RARITIES } from './data/rarities.js';
import { KEYWORDS } from './data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from './data/abilities.js';
import { TRIBAL_CONDITIONS, TRIBAL_TARGETS } from './data/tribal_rules.js';
import { ManaCalculator } from './modules/ManaCalculator.js';
import { gm } from './modules/GameManager.js';
import { abilityBuilder } from './modules/AbilityBuilder.js';
import { lang } from './modules/LanguageManager.js'; // NEW IMPORT

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
    image: null,
    artConfig: { x: 0, y: 0, zoom: 100 }
};

// --- 2. DOM ELEMENTS ---
const ui = {
    form: document.getElementById('cardForm'),
    
    // Header & Settings
    btnToggleLang: document.getElementById('btnToggleLang'), // NEW
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
    
    // Art Inputs
    imageUpload: document.getElementById('imageUpload'),
    artControls: document.getElementById('artControls'),
    artX: document.getElementById('artX'),
    artY: document.getElementById('artY'),
    artZoom: document.getElementById('artZoom'),

    // Stats & Flavor
    attack: document.getElementById('statAttack'),
    health: document.getElementById('statHealth'),
    flavor: document.getElementById('cardFlavor'),
    keywordContainer: document.getElementById('keyword-container'),
    
    // Ability Section
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
    pGem: document.getElementById('rarityGem'),
    
    // Export & Log
    btnSaveJSON: document.getElementById('btnSaveJSON'),
    btnSaveImage: document.getElementById('btnSaveImage'),
    log: document.getElementById('balanceLog')
};

// --- 3. INITIALIZATION ---
function init() {
    abilityBuilder.init(); 
    initVisualEffects(); 
    
    // Localization Init
    lang.translatePage();
    updateLangButton();
    
    // Subscribe to language changes to refresh UI
    lang.subscribe(() => {
        updateLangButton();
        populateDropdowns(); // Refresh options in new language
        renderAbilitiesSummary(); // Refresh summary text
        updateCardState(); // Refresh preview text
    });

    populateDropdowns();
    setupEventListeners();
    updateCardState(); 
}

function updateLangButton() {
    // Update button text to show what you WILL switch to
    ui.btnToggleLang.textContent = lang.code === 'en' ? "🇪🇸 ES" : "🇺🇸 EN";
}

function populateDropdowns() {
    // Save current selections to restore them after repopulating
    const currentRarity = ui.rarity.value;
    const currentTribe = ui.tribe.value;

    // 1. Rarities (Translated)
    ui.rarity.innerHTML = '';
    RARITIES.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = lang.translate(r.name); // Fix: Translate Name
        ui.rarity.appendChild(opt);
    });
    if (currentRarity) ui.rarity.value = currentRarity;

    // 2. Tribes (Translated)
    ui.tribe.innerHTML = '';
    const tribes = gm.getTribes();
    
    tribes.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = lang.translate(t.name); // Fix: Translate Name
        ui.tribe.appendChild(opt);
    });

    // Default selection logic
    if (tribes.find(t => t.id === currentCard.tribe)) {
        ui.tribe.value = currentCard.tribe;
    } else {
        ui.tribe.value = tribes[0]?.id || "neutral";
    }

    // 3. Keywords (Translated + Descriptions)
    ui.keywordContainer.innerHTML = ''; 
    KEYWORDS.forEach(k => {
        const div = document.createElement('div');
        div.className = 'keyword-block'; // New CSS Class
        
        const isChecked = currentCard.keywords[k.id] ? 'checked' : '';
        const translatedName = lang.translate(k.name);
        const translatedDesc = lang.translate(k.description);

        div.innerHTML = `
            <label class="keyword-label-row">
                <input type="checkbox" id="kw-${k.id}" value="${k.id}" class="keyword-check" ${isChecked}>
                <span>${translatedName}</span>
            </label>
            <div class="keyword-description">${translatedDesc}</div>
        `;
        ui.keywordContainer.appendChild(div);
    });
    
    // Re-bind listeners
    document.querySelectorAll('.keyword-check').forEach(el => {
        el.addEventListener('change', updateCardState);
    });
}

function setupEventListeners() {
    // Language Toggle
    ui.btnToggleLang.addEventListener('click', () => {
        lang.toggleLanguage();
    });

    // Main Form Delegation
    ui.form.addEventListener('input', (e) => {
        if(!['imageUpload', 'artX', 'artY', 'artZoom'].includes(e.target.id)) {
            updateCardState();
        }
    });

    ui.type.addEventListener('change', handleTypeChange);
    
    // Art Controls
    const updateArt = () => {
        currentCard.artConfig.x = parseInt(ui.artX.value);
        currentCard.artConfig.y = parseInt(ui.artY.value);
        currentCard.artConfig.zoom = parseInt(ui.artZoom.value);
        renderArtTransform();
    };
    ui.artX.addEventListener('input', updateArt);
    ui.artY.addEventListener('input', updateArt);
    ui.artZoom.addEventListener('input', updateArt);

    // Ability Modal
    if(ui.btnOpenAbilityModal) {
        ui.btnOpenAbilityModal.addEventListener('click', () => {
            abilityBuilder.open((newAbilityData) => {
                currentCard.abilities.push(newAbilityData);
                renderAbilitiesSummary();
                updateCardState();
            });
        });
    }

    // Asset & Export
    ui.imageUpload.addEventListener('change', handleImageUpload);
    ui.btnSaveJSON.addEventListener('click', downloadJSON);
    ui.btnSaveImage.addEventListener('click', downloadImage);

    // Settings Modal
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

// --- 4. VISUAL EFFECTS ---

function initVisualEffects() {
    const cardArea = document.querySelector('.card-render-area');
    const cardFrame = document.getElementById('cardPreview');
    const constrain = 15; 

    if (!cardArea || !cardFrame) return;

    cardArea.addEventListener('mousemove', (e) => {
        const rect = cardFrame.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let xPercent = (x / rect.width) * 100;
        let yPercent = (y / rect.height) * 100;

        xPercent = Math.min(100, Math.max(0, xPercent));
        yPercent = Math.min(100, Math.max(0, yPercent));

        cardFrame.style.setProperty('--mx', `${xPercent}%`);
        cardFrame.style.setProperty('--my', `${yPercent}%`);

        let rotateY = ((xPercent - 50) / 50) * constrain; 
        let rotateX = -((yPercent - 50) / 50) * constrain;

        cardFrame.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    cardArea.addEventListener('mouseleave', () => {
        cardFrame.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
        cardFrame.style.setProperty('--mx', `50%`);
        cardFrame.style.setProperty('--my', `50%`);
    });
}

// --- 5. ASSET HANDLING ---

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        currentCard.image = event.target.result;
        currentCard.artConfig = { x: 0, y: 0, zoom: 100 };
        ui.artX.value = 0;
        ui.artY.value = 0;
        ui.artZoom.value = 100;
        updateCardState();
    };
    reader.readAsDataURL(file);
}

function renderArtTransform() {
    if (!ui.pArt) return;
    const { x, y, zoom } = currentCard.artConfig;
    ui.pArt.style.transform = `translate(${x}px, ${y}px) scale(${zoom / 100})`;
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

// --- 6. LOGIC CORE ---

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
        ui.healthLabel.textContent = (type === 'weapon') ? lang.getText('ui_label_durability') : lang.getText('ui_label_health');
    }
    updateCardState();
}

function updateCardState() {
    // Scrape Inputs
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

    // Calculate Balance
    const report = ManaCalculator.calculate(currentCard);

    // Render
    renderPreview(report);
    renderLog(report);
}

// --- 7. RENDER ---

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
    ui.pTribe.textContent = lang.translate(tribeData.name); // Fix: Translate Tribe on Card

    // Art Handling
    if (currentCard.image) {
        ui.pArt.src = currentCard.image;
        ui.pArt.style.display = 'block';
        ui.pArtPlaceholder.style.display = 'none';
        ui.artControls.classList.remove('input-hidden');
        renderArtTransform();
    } else {
        ui.pArt.style.display = 'none';
        ui.pArtPlaceholder.style.display = 'flex';
        ui.artControls.classList.add('input-hidden');
        ui.pArt.style.transform = ''; 
    }

    // --- RULES TEXT GENERATION ---
    let ruleHtml = "";
    
    // Keywords with Reminder Text
    const kws = Object.keys(currentCard.keywords)
        .map(kId => {
            const kw = KEYWORDS.find(k => k.id === kId);
            if (!kw) return kId;
            // Format: Bold Name + Italic Description
            return `<b>${lang.translate(kw.name)}</b> <i>(${lang.translate(kw.description)})</i>`;
        });
    
    if (kws.length) {
        // Join with newlines or bullets if there are many, or commas if few
        ruleHtml += `${kws.join('<br>')}<br>`; 
    }

    // Abilities
    currentCard.abilities.forEach(ab => {
        ruleHtml += generateAbilityText(ab) + "<br>";
    });

    ui.pText.innerHTML = ruleHtml;
    fitText(ui.pText, 9, 14);

    // Visuals: Rarity Gem
    if(ui.pGem) {
        ui.pGem.className = 'rarity-gem';
        ui.pGem.classList.add(`gem-${currentCard.rarity}`);
    }

    // Visuals: Frame & Colors
    ui.pFrame.className = `card-frame rarity-${currentCard.rarity} type-${currentCard.type}`;
    
    if (tribeData && tribeData.color) {
        ui.pFrame.style.borderColor = tribeData.color;
        ui.pFrame.style.setProperty('--tribe-color', tribeData.color);
    } else {
        ui.pFrame.style.borderColor = ''; 
        ui.pFrame.style.removeProperty('--tribe-color');
    }
}

// --- 8. HELPER FUNCTIONS ---

function fitText(container, minSize = 9, maxSize = 14) {
    let currentSize = maxSize;
    container.style.fontSize = `${currentSize}px`;
    // Force reset to check overflow
    while (container.scrollHeight > container.offsetHeight && currentSize > minSize) {
        currentSize -= 0.5;
        container.style.fontSize = `${currentSize}px`;
    }
}

function generateAbilityText(ab) {
    const tribes = gm.getTribes();
    const trig = TRIGGERS.find(t => t.id === ab.trigger);
    const eff = EFFECTS.find(e => e.id === ab.effect);
    const targ = TARGETS.find(t => t.id === ab.target);
    
    let text = "";
    
    // Trigger
    const trigName = trig ? lang.translate(trig.name) : "Ability";
    if (trig && trig.id !== 'passive') {
        if (ab.flavorName && ab.flavorName.trim() !== "") {
            text += `<b>${ab.flavorName} (${trigName}):</b> `;
        } else {
            text += `<b>${trigName}:</b> `;
        }
    } else {
        if (ab.flavorName) text += `<b>${ab.flavorName}:</b> `;
    }
    
    // Condition
    if (ab.condition) {
        const genCond = GENERIC_CONDITIONS.find(c => c.id === ab.condition);
        const tribeCond = TRIBAL_CONDITIONS.find(c => c.id === ab.condition);
        let condName = genCond ? lang.translate(genCond.name) : (tribeCond ? lang.translate(tribeCond.name) : "");
        
        if (condName.includes("[Tribe]") && ab.conditionParam) {
            const cTribe = tribes.find(t => t.id === ab.conditionParam);
            const trName = cTribe ? lang.translate(cTribe.name) : "Tribe";
            condName = condName.replace("[Tribe]", trName).replace("[Tribu]", trName);
        }
        text += `<i>(${condName})</i> `;
    }

    // Effect
    let effText = eff ? lang.translate(eff.name) : "Effect";

    if (effText.includes("[Tribe]") && ab.effectTribe) {
        const eTribe = tribes.find(t => t.id === ab.effectTribe);
        const trName = eTribe ? lang.translate(eTribe.name) : "Tribe";
        effText = effText.replace("[Tribe]", trName).replace("[Tribu]", trName);
    }

    if (eff && eff.id === 'summon_token' && ab.tokenData) {
        const tokenName = ab.tokenData.name || "Token";
        // Simple manual construction since we lack deep grammar engine
        effText = `${lang.translate(eff.name)} ${ab.tokenData.attack}/${ab.tokenData.health} ${tokenName}`;
        effText = effText.replace("Token", "").replace("Ficha", ""); // Remove placeholder
    } else if (eff && eff.id === 'give_keyword' && ab.keyword) {
        const kName = KEYWORDS.find(k => k.id === ab.keyword);
        const translatedKw = kName ? lang.translate(kName.name) : "Keyword";
        // Simple swap for EN/ES "Give X"
        effText = effText.replace("Keyword", translatedKw).replace("Palabra Clave", translatedKw);
    } else if (effText.includes("X")) {
        effText = effText.replace('X', ab.value);
    } else {
        if (eff && eff.requiresValue) effText += ` ${ab.value}`;
    }
    text += effText;

    // Target
    if (targ && targ.id !== 'none') {
        const prep = lang.code === 'es' ? " a " : " to ";
        text += `${prep}${lang.translate(targ.name)}`;
    }
    
    return text + ".";
}

function renderAbilitiesSummary() {
    ui.abilitiesListSummary.innerHTML = '';
    currentCard.abilities.forEach((ab, index) => {
        const item = document.createElement('div');
        item.className = 'ability-summary-item';
        
        const triggerObj = TRIGGERS.find(t => t.id === ab.trigger);
        const triggerName = triggerObj ? lang.translate(triggerObj.name) : "Ability";
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

function renderTribeSettingsList() {
    ui.settingsTribeList.innerHTML = '';
    const tribes = gm.getTribes();
    tribes.forEach(tribe => {
        const row = document.createElement('div');
        row.className = 'tribe-row';
        row.innerHTML = `
            <input type="color" value="${tribe.color}" class="edit-color" data-id="${tribe.id}">
            <input type="text" value="${lang.translate(tribe.name)}" class="edit-name" data-id="${tribe.id}">
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

function openSettings() {
    renderTribeSettingsList();
    ui.settingsModal.classList.remove('hidden');
}

function closeSettings() {
    ui.settingsModal.classList.add('hidden');
    populateDropdowns(); 
    updateCardState();
}

function renderLog(report) {
    // Localize log labels
    const t = (k) => lang.getText(k);
    
    let html = `<strong>${t('ui_log_mana')}: ${report.manaCost}</strong><br>`;
    html += `<small>${t('ui_log_vp')}: ${report.totalVP.toFixed(1)}</small><hr>`;
    html += `${t('ui_log_base')}: ${report.breakdown.base}<br>`;
    if(report.breakdown.stats) html += `${t('ui_log_stats')}: ${report.breakdown.stats}<br>`;
    if(report.breakdown.keywords) html += `${t('ui_log_keywords')}: ${report.breakdown.keywords}<br>`;
    if(report.breakdown.abilities) html += `${t('ui_log_abilities')}: ${report.breakdown.abilities.toFixed(1)}<br>`;
    if(report.breakdown.rarityDiscount) html += `<span style="color:green">${t('ui_log_discount')}: -${report.breakdown.rarityDiscount}</span><br>`;
    if(report.breakdown.typeMod && report.breakdown.typeMod !== 0) {
        html += `${t('ui_log_typemod')}: ${report.breakdown.typeMod.toFixed(1)}<br>`;
    }
    
    if (report.warnings.length > 0) {
        html += `<hr><span style="color:red">${report.warnings.join('<br>')}</span>`;
    }

    ui.log.innerHTML = html;
}

init();