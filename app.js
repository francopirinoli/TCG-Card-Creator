import { RARITIES } from './data/rarities.js';
import { TRIBES } from './data/tribes.js';
import { KEYWORDS } from './data/keywords.js';
import { TRIGGERS, TARGETS, EFFECTS, GENERIC_CONDITIONS } from './data/abilities.js';
import { TRIBAL_CONDITIONS } from './data/tribal_rules.js';
import { ManaCalculator } from './modules/ManaCalculator.js';

console.log("Card Forge Initializing...");

// --- 1. GLOBAL STATE ---
let currentCard = {
    name: "New Card",
    type: "minion",
    rarity: "common",
    tribe: "general",
    stats: { attack: 0, health: 1 },
    keywords: {},
    abilities: [],
    flavorText: "",
    image: null // Base64 string for the art
};

// --- 2. DOM ELEMENTS ---
const ui = {
    form: document.getElementById('cardForm'),
    
    // Inputs
    name: document.getElementById('cardName'),
    type: document.getElementById('cardType'),
    rarity: document.getElementById('cardRarity'),
    tribe: document.getElementById('cardTribe'),
    imageUpload: document.getElementById('imageUpload'),
    attack: document.getElementById('statAttack'),
    health: document.getElementById('statHealth'),
    flavor: document.getElementById('cardFlavor'),
    keywordContainer: document.getElementById('keyword-container'),
    
    // Ability Section
    abilitiesList: document.getElementById('abilities-list'),
    btnAddAbility: document.getElementById('btnAddAbility'),

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
    populateDropdowns();
    setupEventListeners();
    updateCardState(); // Initial Calc
}

function populateDropdowns() {
    // Rarities
    RARITIES.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name;
        ui.rarity.appendChild(opt);
    });

    // Tribes
    TRIBES.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name.en;
        ui.tribe.appendChild(opt);
    });

    // Keywords
    KEYWORDS.forEach(k => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="kw-${k.id}" value="${k.id}" class="keyword-check">
            <label for="kw-${k.id}">${k.name}</label>
        `;
        ui.keywordContainer.appendChild(div);
    });
}

function setupEventListeners() {
    // Global Form Listener (Delegation) for text/sliders
    ui.form.addEventListener('input', (e) => {
        if(e.target.id !== 'imageUpload') {
            updateCardState();
        }
    });

    ui.type.addEventListener('change', handleTypeChange);
    
    // Add Ability Button
    ui.btnAddAbility.addEventListener('click', () => {
        addAbilityRow();
        updateCardState();
    });

    // Image Upload
    ui.imageUpload.addEventListener('change', handleImageUpload);

    // Exports
    ui.btnSaveJSON.addEventListener('click', downloadJSON);
    ui.btnSaveImage.addEventListener('click', downloadImage);
}

// --- 4. ASSET HANDLING ---

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        currentCard.image = event.target.result; // Store Base64
        renderPreview(ManaCalculator.calculate(currentCard)); // Re-render
    };
    reader.readAsDataURL(file);
}

function downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentCard, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${currentCard.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function downloadImage() {
    const node = document.querySelector('.card-render-area'); // Capture wrapper to get padding/shadows
    
    // Using html-to-image library
    htmlToImage.toPng(node)
        .then(function (dataUrl) {
            const link = document.createElement('a');
            link.download = `${currentCard.name.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
            alert("Error generating image. See console.");
        });
}

// --- 5. ABILITY BUILDER LOGIC ---

function addAbilityRow() {
    const rowId = 'ab-' + Date.now();
    const row = document.createElement('div');
    row.className = 'ability-row';
    row.id = rowId;

    // Build Options
    let triggerOpts = TRIGGERS.map(t => `<option value="${t.id}">${t.name.en}</option>`).join('');
    
    let condOpts = `<option value="none">No Condition</option>`;
    condOpts += GENERIC_CONDITIONS.map(c => `<option value="${c.id}">${c.name.en}</option>`).join('');
    condOpts += `<optgroup label="Tribal">${TRIBAL_CONDITIONS.map(c => `<option value="${c.id}">${c.name.en}</option>`).join('')}</optgroup>`;

    let effectOpts = EFFECTS.map(e => `<option value="${e.id}" data-req-val="${e.requiresValue || false}" data-req-stats="${e.requiresStats || false}">${e.name.en}</option>`).join('');

    let targetOpts = TARGETS.map(t => `<option value="${t.id}">${t.name.en}</option>`).join('');

    row.innerHTML = `
        <div class="ability-row-header">
            <span>Ability</span>
            <button type="button" class="btn-remove" onclick="document.getElementById('${rowId}').remove(); document.getElementById('cardForm').dispatchEvent(new Event('input'));">X</button>
        </div>
        <div class="mad-libs-line">
            <select class="ab-trigger">${triggerOpts}</select>
            <select class="ab-condition">${condOpts}</select>
        </div>
        <div class="mad-libs-line">
            <select class="ab-effect">${effectOpts}</select>
            <select class="ab-target">${targetOpts}</select>
            <input type="number" class="ab-value input-sm" placeholder="Val" value="1" style="display:none">
        </div>
    `;

    ui.abilitiesList.appendChild(row);

    // Listener for Effect inputs visibility
    const effectSelect = row.querySelector('.ab-effect');
    const valInput = row.querySelector('.ab-value');
    
    effectSelect.addEventListener('change', () => {
        const selectedOpt = effectSelect.options[effectSelect.selectedIndex];
        const reqVal = selectedOpt.dataset.reqVal === "true";
        const reqStats = selectedOpt.dataset.reqStats === "true";
        
        if (reqVal || reqStats) {
            valInput.style.display = 'block';
            valInput.placeholder = reqStats ? "Atk+HP" : "Value";
        } else {
            valInput.style.display = 'none';
            valInput.value = 0;
        }
    });
    
    // Initial check
    effectSelect.dispatchEvent(new Event('change'));
}

function scrapeAbilities() {
    const rows = document.querySelectorAll('.ability-row');
    const abilities = [];

    rows.forEach(row => {
        const trigger = row.querySelector('.ab-trigger').value;
        const condition = row.querySelector('.ab-condition').value;
        const effect = row.querySelector('.ab-effect').value;
        const target = row.querySelector('.ab-target').value;
        const value = parseInt(row.querySelector('.ab-value').value) || 0;

        abilities.push({
            trigger,
            condition: condition === 'none' ? undefined : condition,
            effect,
            target,
            value
        });
    });

    return abilities;
}

// --- 6. CORE UPDATE LOOP ---

function handleTypeChange() {
    const type = ui.type.value;
    currentCard.type = type;

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
    // 1. Scrape Inputs
    currentCard.name = ui.name.value || "New Card";
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

    // 2. Scrape Dynamic Abilities
    currentCard.abilities = scrapeAbilities();

    // 3. Calculate
    const report = ManaCalculator.calculate(currentCard);

    // 4. Render
    renderPreview(report);
    renderLog(report);
}

function renderPreview(report) {
    // Basic Text
    ui.pName.textContent = currentCard.name;
    ui.pMana.textContent = report.manaCost;
    ui.pFlavor.textContent = currentCard.flavorText;
    
    // Stats
    ui.valAttack.textContent = currentCard.stats.attack;
    ui.valHealth.textContent = currentCard.stats.health;
    ui.pAttack.textContent = currentCard.stats.attack;
    ui.pHealth.textContent = currentCard.stats.health;

    // Tribe Name
    const tribeData = TRIBES.find(t => t.id === currentCard.tribe);
    ui.pTribe.textContent = tribeData ? tribeData.name.en : "";

    // Card Art
    if (currentCard.image) {
        ui.pArt.src = currentCard.image;
        ui.pArt.style.display = 'block';
        ui.pArtPlaceholder.style.display = 'none';
    } else {
        ui.pArt.style.display = 'none';
        ui.pArtPlaceholder.style.display = 'flex';
    }

    // Generate Rules Text
    let ruleHtml = "";
    
    // Keywords
    const kws = Object.keys(currentCard.keywords)
        .map(kId => KEYWORDS.find(k => k.id === kId).name);
    if (kws.length) ruleHtml += `<b>${kws.join(', ')}</b>. <br>`;

    // Abilities
    currentCard.abilities.forEach(ab => {
        const trig = TRIGGERS.find(t => t.id === ab.trigger);
        const eff = EFFECTS.find(e => e.id === ab.effect);
        const targ = TARGETS.find(t => t.id === ab.target);
        
        let text = "";
        
        // Bold Trigger
        if (trig.id !== 'passive') text += `<b>${trig.name.en}:</b> `;
        
        // Italics Condition
        if (ab.condition) {
            const genCond = GENERIC_CONDITIONS.find(c => c.id === ab.condition);
            const tribeCond = TRIBAL_CONDITIONS.find(c => c.id === ab.condition);
            const condName = genCond ? genCond.name.en : (tribeCond ? tribeCond.name.en : "");
            text += `<i>(${condName})</i> `;
        }

        // Effect Text
        // If effect name contains "X", replace it. Otherwise append value.
        if (eff.name.en.includes("X")) {
             text += eff.name.en.replace('X', ab.value);
        } else {
             text += eff.name.en;
             if (eff.requiresValue) text += ` ${ab.value}`;
        }

        // Target Text
        if (targ.id !== 'none') text += ` to ${targ.name.en}`;
        
        ruleHtml += `${text}. <br>`;
    });

    ui.pText.innerHTML = ruleHtml;

    // Frame Classes
    ui.pFrame.className = `card-frame rarity-${currentCard.rarity} type-${currentCard.type}`;
    
    // Tribe Color Override
    if (tribeData && tribeData.color) {
        // We override the border color set by rarity
        ui.pFrame.style.borderColor = tribeData.color;
    } else {
        ui.pFrame.style.borderColor = ''; // Revert to CSS default
    }
}

function renderLog(report) {
    let html = `<strong>Mana Cost: ${report.manaCost}</strong><br>`;
    html += `<small>Total VP: ${report.totalVP.toFixed(1)}</small><hr>`;
    html += `Base: ${report.breakdown.base}<br>`;
    if(report.breakdown.stats) html += `Stats: ${report.breakdown.stats}<br>`;
    if(report.breakdown.keywords) html += `Keywords: ${report.breakdown.keywords}<br>`;
    if(report.breakdown.abilities) html += `Abilities: ${report.breakdown.abilities.toFixed(1)}<br>`;
    if(report.breakdown.rarityDiscount) html += `<span style="color:green">Rarity: -${report.breakdown.rarityDiscount}</span><br>`;
    if(report.breakdown.typeMod !== 0) html += `Type Mod: ${report.breakdown.typeMod.toFixed(1)}<br>`;
    
    if (report.warnings.length > 0) {
        html += `<hr><span style="color:red">${report.warnings.join('<br>')}</span>`;
    }

    ui.log.innerHTML = html;
}

init();