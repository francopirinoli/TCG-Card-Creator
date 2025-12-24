import { RARITIES } from './data/rarities.js';
import { TRIBES } from './data/tribes.js';
import { KEYWORDS } from './data/keywords.js';
import { ManaCalculator } from './modules/ManaCalculator.js';

console.log("Card Forge Initializing...");

// --- 1. GLOBAL STATE ---
// This object represents the card currently being edited.
let currentCard = {
    name: "New Card",
    type: "minion",
    rarity: "common",
    tribe: "general",
    stats: {
        attack: 0,
        health: 1
    },
    keywords: {}, // { taunt: true, windfury: false }
    abilities: [], // { trigger: 'on_play', effect: 'damage', ... }
    flavorText: ""
};

// --- 2. DOM ELEMENTS ---
const ui = {
    form: document.getElementById('cardForm'),
    
    // Inputs
    name: document.getElementById('cardName'),
    type: document.getElementById('cardType'),
    rarity: document.getElementById('cardRarity'),
    tribe: document.getElementById('cardTribe'),
    attack: document.getElementById('statAttack'),
    health: document.getElementById('statHealth'),
    flavor: document.getElementById('cardFlavor'),
    keywordContainer: document.getElementById('keyword-container'),
    
    // Dynamic Labels/Sections
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
    
    // Debug Output
    log: document.getElementById('balanceLog')
};

// --- 3. INITIALIZATION ---
function init() {
    populateDropdowns();
    setupEventListeners();
    
    // Run first calculation
    updateCardState();
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
        opt.textContent = t.name.en; // Default to English for now
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
    // Listen to ANY change in the form to trigger updates
    ui.form.addEventListener('input', (e) => {
        updateCardState();
    });

    // Special handler for Type changes (Visual toggle)
    ui.type.addEventListener('change', handleTypeChange);
}

// --- 4. LOGIC CORE ---

function handleTypeChange() {
    const type = ui.type.value;
    
    // Update State
    currentCard.type = type;

    // Update UI Visibility
    if (type === 'spell') {
        ui.statsSection.style.display = 'none';
        ui.pAttack.style.display = 'none';
        ui.pHealth.style.display = 'none';
    } else {
        ui.statsSection.style.display = 'flex';
        ui.pAttack.style.display = 'flex';
        ui.pHealth.style.display = 'flex';
        
        // Update Label (Health vs Durability)
        if (type === 'weapon') {
            ui.healthLabel.textContent = "Durability";
        } else {
            ui.healthLabel.textContent = "Health";
        }
    }
    
    // Trigger re-calc
    updateCardState();
}

function updateCardState() {
    // 1. Read values from Inputs
    currentCard.name = ui.name.value || "New Card";
    currentCard.rarity = ui.rarity.value;
    currentCard.tribe = ui.tribe.value;
    currentCard.flavorText = ui.flavor.value;
    currentCard.type = ui.type.value;

    // Handle Stats (ignore if spell)
    if (currentCard.type === 'spell') {
        currentCard.stats.attack = 0;
        currentCard.stats.health = 0;
    } else {
        currentCard.stats.attack = parseInt(ui.attack.value);
        currentCard.stats.health = parseInt(ui.health.value);
    }

    // Handle Keywords
    currentCard.keywords = {};
    const checks = document.querySelectorAll('.keyword-check');
    checks.forEach(chk => {
        if (chk.checked) {
            currentCard.keywords[chk.value] = true;
        }
    });

    // 2. Run Calculation
    const report = ManaCalculator.calculate(currentCard);

    // 3. Update UI
    renderPreview(report);
    renderLog(report);
}

// --- 5. RENDERERS ---

function renderPreview(report) {
    // Text Updates
    ui.pName.textContent = currentCard.name;
    ui.pMana.textContent = report.manaCost;
    
    // Stats
    ui.valAttack.textContent = currentCard.stats.attack;
    ui.valHealth.textContent = currentCard.stats.health;
    ui.pAttack.textContent = currentCard.stats.attack;
    ui.pHealth.textContent = currentCard.stats.health;

    // Tribe Display
    const tribeData = TRIBES.find(t => t.id === currentCard.tribe);
    ui.pTribe.textContent = tribeData ? tribeData.name.en : "";

    // Text Box Generation (Keywords + Abilities)
    let ruleText = "";
    
    // A. Keywords
    const activeKeywords = Object.keys(currentCard.keywords)
        .map(kId => KEYWORDS.find(k => k.id === kId).name);
    
    if (activeKeywords.length > 0) {
        ruleText += `<b>${activeKeywords.join(', ')}</b>. `;
    }

    // B. Flavor
    ui.pFlavor.textContent = currentCard.flavorText;
    ui.pText.innerHTML = ruleText;

    // Visual Styles (Colors)
    ui.pFrame.className = `card-frame rarity-${currentCard.rarity} type-${currentCard.type}`;
    
    // Tribe Color Injection (Optional visual flair)
    if (tribeData && tribeData.color) {
        ui.pFrame.style.borderColor = tribeData.color; // Override rarity color with Tribe color if desired
        // Or apply to background? Let's stick to rarity border for now as per CSS
    }
}

function renderLog(report) {
    let html = `<strong>Mana Cost: ${report.manaCost}</strong><br>`;
    html += `<small>Total Value Points: ${report.totalVP.toFixed(1)}</small><hr>`;
    
    html += `Base Cost: ${report.breakdown.base}<br>`;
    
    if (report.breakdown.stats > 0) {
        html += `Stats VP: ${report.breakdown.stats}<br>`;
    }
    
    if (report.breakdown.keywords > 0) {
        html += `Keywords VP: ${report.breakdown.keywords}<br>`;
    }
    
    if (report.breakdown.typeMod !== 0) {
        // Show type modifier impact (e.g., Spell discount)
        const val = report.breakdown.typeMod.toFixed(1);
        const color = val < 0 ? '#4caf50' : '#f44336'; // Green for discount
        html += `<span style="color:${color}">Type Mod: ${val}</span><br>`;
    }

    if (report.breakdown.rarityDiscount > 0) {
        html += `<span style="color:#4caf50">Rarity Discount: -${report.breakdown.rarityDiscount}</span><br>`;
    }

    if (report.warnings.length > 0) {
        html += `<hr><span style="color:red">${report.warnings.join('<br>')}</span>`;
    }

    ui.log.innerHTML = html;
}

// Start
init();